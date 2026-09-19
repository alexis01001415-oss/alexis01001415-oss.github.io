import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Progressive enhancement: all six illustrated chapters are usable without WebGL or JS. */
export function initWarehouseTour() {
  const tour = document.querySelector<HTMLElement>('#warehouse-tour');
  if (!tour || tour.dataset.initialized) return;
  tour.dataset.initialized = 'true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const notice = document.querySelector<HTMLElement>('#warehouse-experience-notice')!;
  const message = document.querySelector<HTMLElement>('#warehouse-experience-message')!;
  const enable = document.querySelector<HTMLButtonElement>('#warehouse-enable')!;
  let active = false,
    cleanup = () => {};
  const explain = (text: string, canEnable: boolean) => {
    notice.hidden = false;
    message.textContent = text;
    enable.hidden = !canEnable;
  };
  const explainReduced = () => {
    tour.dataset.webgl = 'reduced';
    explain(
      'Tu preferencia de movimiento reducido está activa. Puedes explorar los seis capítulos en imágenes o activar el recorrido 3D.',
      true,
    );
  };
  const activate = () => {
    if (active) return;
    active = true;
    notice.hidden = true;
    cleanup = enhanceWarehouseTour(tour, () => {
      active = false;
      explain(
        'El 3D no está disponible en este navegador. Puedes seguir el recorrido completo en estas seis escenas.',
        false,
      );
    });
  };
  enable.addEventListener('click', () => {
    activate();
    requestAnimationFrame(() =>
      window.scrollTo({
        top: tour.getBoundingClientRect().top + scrollY,
        behavior: 'instant',
      }),
    );
  });
  if (reduced.matches) explainReduced();
  else activate();
  reduced.addEventListener('change', (event) => {
    if (event.matches) {
      cleanup();
      active = false;
      explainReduced();
    } else if (tour.dataset.webgl !== 'unavailable') activate();
  });
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) cleanup();
  });
}

function enhanceWarehouseTour(tour: HTMLElement, onUnavailable: () => void) {
  gsap.registerPlugin(ScrollTrigger);
  tour.classList.add('is-enhanced');
  tour.dataset.webgl = 'loading';
  const poster = tour.querySelector<HTMLImageElement>('.warehouse-fallback')!;
  const progressBar = tour.querySelector<HTMLElement>('.warehouse-progress span')!;
  const status = document.querySelector('#warehouse-status')!;
  const pause = document.querySelector<HTMLButtonElement>('#warehouse-motion')!;
  pause.hidden = false;
  pause.setAttribute('aria-pressed', 'false');
  pause.textContent = 'Pausar cámara';
  const jumps = [...tour.querySelectorAll<HTMLButtonElement>('[data-tour-jump]')];
  let progress = 0,
    currentChapter = -1,
    paused = false,
    cancelled = false,
    renderRequest = () => {},
    cleanupGL = () => {};
  const update = (p: number) => {
    progress = p;
    progressBar.style.width = `${p * 100}%`;
    const chapter = Math.min(5, Math.round(p * 5));
    if (chapter !== currentChapter) {
      currentChapter = chapter;
      poster.src = `/images/warehouse-${chapter}.webp`;
      jumps.forEach((b, i) => b.setAttribute('aria-pressed', String(i === chapter)));
    }
    renderRequest();
  };
  const trigger = ScrollTrigger.create({
    trigger: tour,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => update(self.progress),
    onRefresh: (self) => update(self.progress),
  });
  const listeners = new AbortController();
  jumps.forEach((button, i) =>
    button.addEventListener(
      'click',
      () =>
        window.scrollTo({
          top: trigger.start + ((trigger.end - trigger.start) * i) / 5,
          behavior: paused ? 'instant' : 'smooth',
        }),
      { signal: listeners.signal },
    ),
  );
  pause.addEventListener(
    'click',
    () => {
      paused = !paused;
      pause.setAttribute('aria-pressed', String(paused));
      pause.textContent = paused ? 'Activar cámara' : 'Pausar cámara';
      renderRequest();
    },
    { signal: listeners.signal },
  );
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        void loadScene();
      }
    },
    { rootMargin: '500px' },
  );
  observer.observe(tour);
  async function loadScene() {
    const host = document.querySelector<HTMLElement>('#warehouse-canvas')!;
    let renderer: import('three').WebGLRenderer | undefined;
    try {
      status.textContent = 'PREPARANDO RECORRIDO';
      const [THREE, { GLTFLoader }, { DRACOLoader }, { RoomEnvironment }] = await Promise.all([
        import('three'),
        import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/loaders/DRACOLoader.js'),
        import('three/addons/environments/RoomEnvironment.js'),
      ]);
      if (cancelled) return;
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      const gl = renderer;
      gl.setClearColor(0xe0e1dd, 0);
      gl.outputColorSpace = THREE.SRGBColorSpace;
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 0.95;
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
      gl.shadowMap.autoUpdate = false;
      gl.domElement.setAttribute('aria-hidden', 'true');
      host.appendChild(gl.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(49, 1, 0.1, 200);
      const pmrem = new THREE.PMREMGenerator(gl),
        room = new RoomEnvironment();
      const environment = pmrem.fromScene(room, 0.04);
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.65;
      room.dispose();
      pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xe0e1dd, 0x778da9, 0.8));
      const sun = new THREE.DirectionalLight(0xf3f6fc, 2.8);
      sun.position.set(16, 30, 18);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -48;
      sun.shadow.camera.right = 48;
      sun.shadow.camera.top = 48;
      sun.shadow.camera.bottom = -48;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 140;
      sun.shadow.normalBias = 0.1;
      sun.shadow.bias = -0.0002;
      scene.add(sun);
      const fill = new THREE.DirectionalLight(0xd8e5fa, 0.65);
      fill.position.set(-12, 12, -8);
      scene.add(fill);
      const draco = new DRACOLoader();
      draco.setDecoderPath('/decoders/draco/');
      draco.setWorkerLimit(1);
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      const releaseResources = () => {
        environment.dispose();
        sun.shadow.dispose();
        const textures = new Set<import('three').Texture>();
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => {
              Object.values(material).forEach((value) => {
                if (value instanceof THREE.Texture) textures.add(value);
              });
              material.dispose();
            });
          }
        });
        textures.forEach((texture) => texture.dispose());
        gl.dispose();
        gl.domElement.remove();
      };
      cleanupGL = () => {
        draco.dispose();
        releaseResources();
      };
      const model = await loader.loadAsync('/models/warehouse-journey.glb');
      draco.dispose();
      scene.add(model.scene);
      if (cancelled) {
        releaseResources();
        return;
      }
      model.scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      gl.shadowMap.needsUpdate = true;
      // Blender (X,Y,Z) exports to glTF (X,Z,-Y).
      const points = [
        [29, 24, 36],
        [-6, 4.6, 14],
        [7, 3.7, 7],
        [0, 4.2, 0],
        [9, 5.5, -10],
        [29, 15, -42],
      ].map((v) => new THREE.Vector3(...(v as [number, number, number])));
      const targets = [
        [0, 1.5, 0],
        [0, 1.1, 9],
        [2.8, 1.3, 2.8],
        [-7, 2.3, -5],
        [3, 1.9, -15],
        [4, 2.2, -25],
      ].map((v) => new THREE.Vector3(...(v as [number, number, number])));
      let current = progress,
        raf = 0,
        visible = false,
        disposed = false,
        lost = false,
        last = 0;
      const look = new THREE.Vector3(),
        pos = new THREE.Vector3();
      function draw() {
        const p = THREE.MathUtils.clamp(
          (paused ? Math.round(progress * 5) / 5 : current) * 5,
          0,
          5,
        );
        const index = Math.min(4, Math.floor(p)),
          t = p - index,
          smooth = t * t * (3 - 2 * t);
        pos.copy(points[index]!).lerp(points[index + 1]!, smooth);
        look.copy(targets[index]!).lerp(targets[index + 1]!, smooth);
        camera.position.copy(pos);
        camera.lookAt(look);
        gl.render(scene, camera);
        host.dataset.cameraProgress = p.toFixed(3);
        host.dataset.cameraPosition = camera.position
          .toArray()
          .map((value) => value.toFixed(3))
          .join(',');
      }
      function frame(time: number) {
        raf = 0;
        if (disposed || lost || !visible || document.hidden) return;
        const dt = Math.max(0, Math.min(0.05, (time - last) / 1000 || 0.016));
        last = time;
        current = paused ? progress : THREE.MathUtils.damp(current, progress, 7, dt);
        draw();
        if (!paused && Math.abs(current - progress) > 0.00005) raf = requestAnimationFrame(frame);
      }
      function request() {
        if (!raf && !disposed && !lost && visible && !document.hidden) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      }
      renderRequest = request;
      const resize = () => {
        const rect = host.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        gl.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth <= 900 ? 1.25 : 1.5));
        gl.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / rect.height;
        // Keep the horizontal field of view generous in portrait while the scene
        // remains a real, full-screen WebGL canvas behind the chapter card.
        camera.fov = THREE.MathUtils.radToDeg(
          2 *
            Math.atan(
              Math.tan(THREE.MathUtils.degToRad(49) / 2) * Math.max(1, 0.98 / camera.aspect),
            ),
        );
        const portrait = rect.height > rect.width;
        camera.setViewOffset(
          rect.width,
          rect.height,
          portrait ? 0 : rect.width * 0.14,
          portrait ? rect.height * 0.19 : 0,
          rect.width,
          rect.height,
        );
        camera.updateProjectionMatrix();
        request();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      const io = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        host.dataset.inView = String(visible);
        if (visible) request();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      });
      io.observe(host);
      const visibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else request();
      };
      document.addEventListener('visibilitychange', visibility);
      gl.domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        lost = true;
        cancelAnimationFrame(raf);
        raf = 0;
        gl.domElement.style.visibility = 'hidden';
        tour!.dataset.webgl = 'lost';
        status.textContent = 'RECUPERANDO ESCENA 3D';
      });
      gl.domElement.addEventListener('webglcontextrestored', () => {
        lost = false;
        gl.shadowMap.needsUpdate = true;
        gl.domElement.style.visibility = '';
        tour!.dataset.webgl = 'ready';
        status.textContent = 'DNR / RECORRIDO EN VIVO';
        resize();
      });
      cleanupGL = () => {
        disposed = true;
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener('visibilitychange', visibility);
        releaseResources();
      };
      tour!.dataset.webgl = 'ready';
      status.textContent = 'DNR / RECORRIDO EN VIVO';
      resize();
    } catch (error) {
      cleanupGL();
      cleanupGL = () => {};
      renderer?.dispose();
      renderer?.domElement.remove();
      if (cancelled) return;
      cancelled = true;
      trigger.kill();
      observer.disconnect();
      tour!.classList.remove('is-enhanced');
      tour!.dataset.webgl = 'unavailable';
      status.textContent = 'RECORRIDO POR CAPÍTULOS';
      pause.hidden = true;
      onUnavailable();
      console.warn('Warehouse 3D unavailable; illustrated chapters remain available.', error);
    }
  }
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted && !cancelled) {
        trigger.refresh();
        renderRequest();
      }
    },
    { signal: listeners.signal },
  );
  return () => {
    cancelled = true;
    trigger.kill();
    observer.disconnect();
    listeners.abort();
    cleanupGL();
    tour.classList.remove('is-enhanced');
  };
}
