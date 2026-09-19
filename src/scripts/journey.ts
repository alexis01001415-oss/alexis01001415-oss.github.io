import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** A Blender-authored GLB, presented as three views of one continuous voyage. */
export async function initJourney(): Promise<void> {
  const host = document.querySelector<HTMLElement>('#journey-scene');
  const voyage = document.querySelector<HTMLElement>('#voyage');
  if (!host || !voyage || host.dataset.webgl) return;

  const fallback = host.querySelector<HTMLElement>('.scene-fallback');
  const toggle = document.querySelector<HTMLButtonElement>('#motion-toggle');
  const progressLabel = document.querySelector<HTMLElement>('#journey-progress');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 767px)');
  const status = (state: string) => {
    host.dataset.webgl = state;
    host.setAttribute('aria-busy', String(state === 'loading'));
    if (toggle) toggle.hidden = state !== 'ready';
    if (fallback) {
      fallback.hidden = state === 'ready';
      fallback.style.display = state === 'ready' ? 'none' : '';
    }
  };
  status('loading');
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch {
    status('unavailable');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText =
    'display:block;width:100%;height:100%;pointer-events:none;opacity:0';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 100);
  const ship = new THREE.Group();
  scene.add(ship);

  // A local studio environment reveals PBR materials without an HDR download.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.045);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.52;
  room.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xe0e1dd, 0x1b263b, 0.85));
  const key = new THREE.DirectionalLight(0xf1f4f8, 3.2);
  key.position.set(-3, 12, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile.matches ? 1024 : 2048, mobile.matches ? 1024 : 2048);
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 40;
  key.shadow.normalBias = 0.022;
  key.shadow.bias = -0.00015;
  key.shadow.radius = 3;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9ab4d4, 1.7);
  rim.position.set(3, 7, -8);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xc7e0ec, 0.95);
  fill.position.set(10, 4, 6);
  scene.add(fill);

  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const floorGeometry = new THREE.PlaneGeometry(50, 50);
  const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.25, depthWrite: false });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.035;
  floor.receiveShadow = true;
  scene.add(floor);
  geometries.add(floorGeometry);
  materials.add(floorMaterial);

  const draco = new DRACOLoader();
  draco.setDecoderPath('/decoders/draco/');
  draco.setWorkerLimit(2);
  const loader = new GLTFLoader().setDRACOLoader(draco);

  function visitResources(root: THREE.Object3D, retain: boolean) {
    const objectGeometries = new Set<THREE.BufferGeometry>();
    const objectMaterials = new Set<THREE.Material>();
    const objectTextures = new Set<THREE.Texture>();
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      objectGeometries.add(object.geometry);
      (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => {
        objectMaterials.add(material);
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) objectTextures.add(value);
        });
      });
      object.castShadow = true;
      object.receiveShadow = true;
    });
    if (retain) {
      objectGeometries.forEach((geometry) => geometries.add(geometry));
      objectMaterials.forEach((material) => materials.add(material));
      objectTextures.forEach((texture) => textures.add(texture));
    } else {
      objectGeometries.forEach((geometry) => geometry.dispose());
      objectMaterials.forEach((material) => material.dispose());
      objectTextures.forEach((texture) => texture.dispose());
    }
  }

  const views = [
    {
      position: new THREE.Vector3(10.3, 7.7, 16.2),
      target: new THREE.Vector3(0.1, 1.35, 0),
      fov: 29,
    },
    {
      position: new THREE.Vector3(3.8, 9.4, 13.1),
      target: new THREE.Vector3(-0.5, 1.5, 0),
      fov: 28,
    },
    {
      position: new THREE.Vector3(-9.5, 7.1, 16.1),
      target: new THREE.Vector3(-0.2, 1.4, 0),
      fov: 29,
    },
  ];
  const position = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  let progress = 0;
  let current = 0;
  let paused = reduced.matches;
  let visible = true;
  let ready = false;
  let lost = false;
  let disposed = false;
  let raf = 0;
  let lastTime = 0;
  let phaseTime = 0;

  function draw(time: number, delta = 0) {
    current = paused
      ? Math.round(progress * 2) / 2
      : THREE.MathUtils.damp(current, progress, 7, delta);
    current = THREE.MathUtils.clamp(current, 0, 1);
    phaseTime += paused ? 0 : delta;
    const point = current * 2;
    const index = Math.min(1, Math.floor(point));
    const blend = THREE.MathUtils.smootherstep(point - index, 0, 1);
    const from = views[index]!;
    const to = views[index + 1]!;
    lookAt.lerpVectors(from.target, to.target, blend);
    position.lerpVectors(from.position, to.position, blend);
    const aspectFit = Math.max(1, 1.42 / camera.aspect);
    position.sub(lookAt).multiplyScalar(aspectFit).add(lookAt);
    camera.position.copy(position);
    camera.fov = THREE.MathUtils.lerp(from.fov, to.fov, blend);
    camera.lookAt(lookAt);
    camera.updateProjectionMatrix();
    ship.position.y = paused ? 0 : Math.sin(phaseTime * 0.52) * 0.018;
    ship.rotation.z = paused ? 0 : Math.sin(phaseTime * 0.37) * 0.002;
    renderer.render(scene, camera);
    lastTime = time;
  }

  function stopFrame() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function frame(time: number) {
    raf = 0;
    if (disposed || lost || !ready || !visible || document.hidden) return;
    const elapsed = time - lastTime;
    if (!mobile.matches || elapsed >= 30) draw(time, Math.max(0, Math.min(elapsed / 1000, 0.05)));
    if (!paused) raf = requestAnimationFrame(frame);
  }
  function requestDraw() {
    if (disposed || lost || !ready || !visible || document.hidden) return;
    if (paused) {
      stopFrame();
      draw(performance.now());
    } else if (!raf) {
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  function report() {
    if (progressLabel)
      progressLabel.textContent = `${Math.round(progress * 100)
        .toString()
        .padStart(2, '0')}%`;
    window.dispatchEvent(
      new CustomEvent('journey-progress', {
        detail: { progress, step: Math.min(2, Math.round(progress * 2)) },
      }),
    );
    requestDraw();
  }
  const trigger = ScrollTrigger.create({
    trigger: voyage,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      progress = self.progress;
      report();
    },
    onRefresh: (self) => {
      progress = self.progress;
      report();
    },
  });

  const syncToggle = () => {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Activar movimiento 3D' : 'Pausar movimiento 3D');
    const label = toggle.querySelector('span');
    if (label) label.textContent = paused ? 'ACTIVAR 3D' : 'PAUSAR 3D';
    toggle.querySelector('path')?.setAttribute('d', paused ? 'm8 4 12 8-12 8z' : 'M8 5v14M16 5v14');
  };
  const toggleMotion = () => {
    paused = !paused;
    syncToggle();
    requestDraw();
  };
  const motionChanged = () => {
    paused = reduced.matches;
    syncToggle();
    requestDraw();
  };
  const visibilityChanged = () => {
    if (document.hidden) stopFrame();
    else requestDraw();
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height || disposed) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.25 : 1.6));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestDraw();
  };
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) requestDraw();
      else stopFrame();
    },
    { threshold: 0 },
  );
  observer.observe(host);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    stopFrame();
    renderer.domElement.style.visibility = 'hidden';
    status('lost');
  };
  const contextRestored = () => {
    lost = false;
    renderer.domElement.style.visibility = '';
    status(ready ? 'ready' : 'loading');
    resize();
  };
  const pageHide = (event: PageTransitionEvent) => {
    if (event.persisted) stopFrame();
    else dispose();
  };
  const pageShow = (event: PageTransitionEvent) => {
    if (event.persisted) resize();
  };

  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
  document.addEventListener('visibilitychange', visibilityChanged);
  reduced.addEventListener('change', motionChanged);
  toggle?.addEventListener('click', toggleMotion);
  window.addEventListener('pagehide', pageHide);
  window.addEventListener('pageshow', pageShow);
  document.addEventListener('astro:before-swap', dispose, { once: true });

  function dispose() {
    if (disposed) return;
    disposed = true;
    stopFrame();
    trigger.kill();
    observer.disconnect();
    resizeObserver.disconnect();
    toggle?.removeEventListener('click', toggleMotion);
    document.removeEventListener('visibilitychange', visibilityChanged);
    reduced.removeEventListener('change', motionChanged);
    window.removeEventListener('pagehide', pageHide);
    window.removeEventListener('pageshow', pageShow);
    document.removeEventListener('astro:before-swap', dispose);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
    draco.dispose();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    environment.dispose();
    key.shadow.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    if (host) delete host.dataset.webgl;
  }

  syncToggle();
  resize();
  progress = trigger.progress;
  current = progress;
  try {
    const asset = await loader.loadAsync('/models/container-ship.glb');
    if (disposed) {
      visitResources(asset.scene, false);
      return;
    }
    visitResources(asset.scene, true);
    ship.add(asset.scene);
    ready = true;
    renderer.domElement.style.opacity = '1';
    status(lost ? 'lost' : 'ready');
    report();
  } catch {
    if (!disposed) {
      dispose();
      status('unavailable');
    }
  } finally {
    draco.dispose();
  }
}
