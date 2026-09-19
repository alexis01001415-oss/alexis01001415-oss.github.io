import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const toggle = document.querySelector<HTMLButtonElement>('.mobile-toggle');
const menu = document.querySelector<HTMLElement>('#mobile-menu');
// Direction changes have a small hysteresis; navigation remains global.
const header = document.querySelector<HTMLElement>('.site-header');
let previousScroll = Math.max(0, window.scrollY);
let scrollTravel = 0;
let headerFrame = 0;
function updateHeader() {
  headerFrame = 0;
  const y = Math.max(0, window.scrollY);
  const delta = y - previousScroll;
  scrollTravel = Math.sign(delta) === Math.sign(scrollTravel) ? scrollTravel + delta : delta;
  const engaged =
    header?.querySelector(':focus-visible') ||
    header?.querySelector('details[open]') ||
    (menu && !menu.hidden);
  header?.classList.toggle('is-scrolled', y > 70);
  if (y < 100 || engaged || scrollTravel < -9) header?.classList.remove('is-hidden');
  else if (scrollTravel > 14) header?.classList.add('is-hidden');
  previousScroll = y;
}
window.addEventListener(
  'scroll',
  () => {
    if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
  },
  { passive: true },
);
header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));
updateHeader();
function closeMenu() {
  if (menu && toggle) {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }
}
toggle?.addEventListener('click', () => {
  if (!menu) return;
  const open = menu.hidden;
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const wasOpen = menu && !menu.hidden;
    closeMenu();
    document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown[open]').forEach((d) => {
      d.open = false;
      d.querySelector('summary')?.focus();
    });
    if (wasOpen) toggle?.focus();
  }
});
document.addEventListener('click', (e) => {
  document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown[open]').forEach((d) => {
    if (!d.contains(e.target as Node)) d.open = false;
  });
  if (menu && !menu.hidden && !(e.target as HTMLElement).closest('.site-header')) closeMenu();
});
document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown').forEach((d) => {
  d.addEventListener('toggle', () => {
    if (d.open)
      document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown').forEach((other) => {
        if (other !== d) other.open = false;
      });
  });
  d.addEventListener('focusout', () => {
    setTimeout(() => {
      if (!d.contains(document.activeElement)) d.open = false;
    }, 0);
  });
});
matchMedia('(min-width:1101px)').addEventListener('change', (e) => {
  if (e.matches) closeMenu();
});

const modes = ['VISIÓN DE ORIGEN', 'CADA DETALLE CUENTA', 'RUMBO A MÉXICO'];
const routes = ['DEL MUNDO → MÉXICO', 'CARGA → DOCUMENTOS → CONTROL', 'PUERTO → CIUDAD DE MÉXICO'];
let current = -1;
function updateJourney(progress: number) {
  const step = progress < 0.25 ? 0 : progress < 0.75 ? 1 : 2;
  const bar = document.querySelector<HTMLElement>('#journey-bar');
  if (bar) bar.style.width = `${progress * 100}%`;
  if (step === current) return;
  current = step;
  document.querySelectorAll<HTMLElement>('[data-scene-copy]').forEach((el, i) => {
    el.classList.toggle('is-active', i === step);
    el.setAttribute('aria-hidden', String(i !== step));
    el.inert = i !== step;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-journey-step]').forEach((el, i) => {
    el.classList.toggle('active', i === step);
    el.setAttribute('aria-pressed', String(i === step));
  });
  const mode = document.querySelector('#scene-mode'),
    route = document.querySelector('#scene-route');
  if (mode) mode.textContent = modes[step];
  if (route) route.textContent = routes[step];
}
if (document.querySelector('#voyage')) {
  updateJourney(0);
  gsap.matchMedia().add('(min-height:600px)', () => {
    const journeyTrigger = ScrollTrigger.create({
      trigger: '#voyage',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => updateJourney(self.progress),
      onRefresh: (self) => updateJourney(self.progress),
    });
    const handlers = [...document.querySelectorAll<HTMLButtonElement>('[data-journey-step]')].map(
      (button) => {
        const handler = () => {
          const step = Math.max(0, Math.min(2, Number(button.dataset.journeyStep) || 0));
          const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
          const paused =
            document.querySelector('#motion-toggle')?.getAttribute('aria-pressed') === 'true';
          window.scrollTo({
            top: journeyTrigger.start + ((journeyTrigger.end - journeyTrigger.start) * step) / 2,
            behavior: reduced || paused ? 'instant' : 'smooth',
          });
        };
        button.addEventListener('click', handler);
        return { button, handler };
      },
    );
    updateJourney(journeyTrigger.progress);
    return () => {
      journeyTrigger.kill();
      handlers.forEach(({ button, handler }) => button.removeEventListener('click', handler));
      updateJourney(0);
    };
  });
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const editorial = document.querySelector<HTMLElement>('.operations-editorial');
  if (editorial) {
    gsap.fromTo(
      editorial,
      { '--chapter-bg': '#0d1b2a' },
      {
        '--chapter-bg': '#e0e1dd',
        ease: 'none',
        scrollTrigger: {
          trigger: editorial,
          start: 'top 90%',
          end: 'top 15%',
          scrub: true,
          onUpdate: (self) => editorial.classList.toggle('is-night', self.progress < 0.48),
        },
      },
    );
  }
}
