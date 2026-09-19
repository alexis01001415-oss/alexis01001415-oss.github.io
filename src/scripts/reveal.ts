/**
 * One-time entrances for editorial content. Call initReveal() after the page's
 * markup exists, and import styles/reveal.css once in the shared layout.
 *
 * Optional markup API: data-reveal="copy|heading|card|media", data-reveal-group
 * on siblings' parent, data-reveal-delay="0..140", data-reveal="off" to opt out.
 * The returned cleanup function restores every target to its original styling.
 */
export function initReveal(root: Document | HTMLElement = document): () => void {
  const selectors = [
    '[data-reveal]',
    '.section-heading',
    '.solutions-bento__heading',
    '.process-timeline__heading',
    '.operations-title',
    '.industry-heading',
    '.decision-heading',
    '.document-route__intro',
    '.operations-copy > .editorial-label',
    '.operations-copy > h3',
    '.operations-intro',
    '.operations-step',
    '.operations-copy > .editorial-link',
    '.operations-photo',
    '.industry-feature-photo',
    '.industry-retail-photo',
    '.inner-image',
    '.port-section > img',
    '.port-content > *',
    '.solutions-tile',
    '.solutions-bento__closing',
    '.process-timeline__stage',
    '.service-card',
    '.resource-card',
    '.connection-card',
    '.value',
    '.route-mode',
    '.document-route__steps > li',
    '.route-decisions__closing',
    '.industry-article-copy',
    '.industry-technology',
    '.industry-retail-copy',
    '.industry-bottom',
    '.coverage-copy',
    '.sector-list > span',
    '.trust-strip > span',
    '.faq-section > div:first-child',
    '.faq-list > details',
    '.closing-banner > .eyebrow',
    '.closing-banner > h2',
    '.closing-banner > .button',
    '.contact-block__intro',
    '.inner-hero > h1',
    '.inner-hero > p',
    '.detail-grid > *',
    '.inner-callout',
    '.inner-content > h2',
    '.inner-content > h3',
    '.inner-content > p',
    '.inner-content > ul',
    '.inner-content > ol',
    '.footer-top > div:first-child',
    '.footer-inquiry',
    '.footer-brand',
  ].join(',');
  const excluded = [
    '#voyage',
    '.hero-copy',
    '[data-scene-copy]',
    '.site-header',
    'nav',
    '.warehouse-section',
    '#warehouse-tour',
    '.cdmx-section',
    '[data-document-flow]',
    'form',
    'fieldset',
    'input',
    'select',
    'textarea',
    'button',
    '[contenteditable]:not([contenteditable="false"])',
    '.quote-layout',
    '#quote-result',
    '.contact-form',
    '[role="status"]',
    '[aria-live]',
    '[hidden]',
    '[inert]',
    '[aria-hidden="true"]',
    '[data-reveal="off"]',
    '[data-dnr-reveal-state]',
  ].join(',');
  const grouped = [
    '[data-reveal-group]',
    '.solutions-bento__grid',
    '.process-timeline__stages',
    '.values-grid',
    '.service-grid',
    '.resource-grid',
    '.connection-grid',
    '.operations-steps',
    '.industry-grid',
    '.document-route__steps',
    '.trust-strip',
    '.sector-list',
  ].join(',');
  const doc = root instanceof Document ? root : root.ownerDocument;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const found = [...root.querySelectorAll<HTMLElement>(selectors)];
  if (root instanceof HTMLElement && root.matches(selectors)) found.unshift(root);
  const candidates = found.filter(
    (element) =>
      element instanceof HTMLElement &&
      !element.dataset.dnrRevealState &&
      !element.closest(excluded) &&
      !element.querySelector(
        'form, fieldset, input, select, textarea, [contenteditable]:not([contenteditable="false"]), #voyage, #warehouse-tour, .cdmx-section, [data-document-flow]',
      ),
  );
  const selected = new Set(candidates);
  // A whole card and its heading never animate twice inside one another.
  const targets = candidates.filter((element) => {
    let parent = element.parentElement;
    while (parent) {
      if (selected.has(parent)) return false;
      parent = parent.parentElement;
    }
    return true;
  });
  if (!targets.length) return () => {};
  const pending = new Set<HTMLElement>();
  const running = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
  const targetSet = new Set(targets);
  let observer: IntersectionObserver | undefined;
  let disposed = false;

  const finish = (element: HTMLElement) => {
    observer?.unobserve(element);
    pending.delete(element);
    const timer = running.get(element);
    if (timer !== undefined) clearTimeout(timer);
    running.delete(element);
    element.classList.remove('dnr-reveal');
    element.dataset.dnrRevealState = 'done';
    element.style.removeProperty('--dnr-reveal-delay');
    element.style.removeProperty('--dnr-reveal-opacity');
  };
  const inView = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return rect.top < innerHeight && rect.bottom > 0 && rect.left < innerWidth && rect.right > 0;
  };
  const revealFocused = (event: FocusEvent) => {
    let element = event.target instanceof HTMLElement ? event.target : null;
    while (element) {
      if (targetSet.has(element)) finish(element);
      element = element.parentElement;
    }
  };
  const revealHash = () => {
    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const anchor = id && doc.getElementById(id);
    if (!anchor) return;
    targets.forEach((element) => {
      if (element.contains(anchor) || (anchor.contains(element) && inView(element)))
        finish(element);
    });
  };
  const stopMotion = () => {
    if (!media.matches) return;
    observer?.disconnect();
    targets.forEach(finish);
  };
  const onAnimationEnd = (event: AnimationEvent) => {
    if (event.animationName !== 'dnr-reveal-enter' || !(event.target instanceof HTMLElement))
      return;
    if (targetSet.has(event.target)) finish(event.target);
  };
  const restore = () => {
    if (media.matches) stopMotion();
    else targets.filter(inView).forEach(finish);
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    targets.forEach(finish);
    media.removeEventListener('change', stopMotion);
    doc.removeEventListener('focusin', revealFocused, true);
    doc.removeEventListener('animationend', onAnimationEnd);
    doc.removeEventListener('animationcancel', onAnimationEnd);
    doc.removeEventListener('astro:before-swap', cleanup);
    window.removeEventListener('hashchange', revealHash);
    window.removeEventListener('pageshow', restore);
    window.removeEventListener('pagehide', onPageHide);
  };
  const onPageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) cleanup();
  };

  // Motion is an enhancement: neither a missing observer nor an initial reduced
  // preference introduces hidden content. Switching preferences never re-hides it.
  if (media.matches || !('IntersectionObserver' in window)) {
    targets.forEach(finish);
    return cleanup;
  }
  observer = new IntersectionObserver(
    (entries) => {
      const counts = new Map<Element | null, number>();
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (!entry.isIntersecting || !pending.has(element)) continue;
        observer?.unobserve(element);
        pending.delete(element);
        if (media.matches || element.contains(doc.activeElement)) {
          finish(element);
          continue;
        }
        const group = element.parentElement?.closest(grouped) || element.parentElement;
        const position = counts.get(group) || 0;
        counts.set(group, position + 1);
        const explicit = Number.parseFloat(element.dataset.revealDelay || '');
        const delay = Math.min(
          140,
          Math.max(0, Number.isFinite(explicit) ? explicit : position * 55),
        );
        element.style.setProperty('--dnr-reveal-delay', `${delay}ms`);
        element.dataset.dnrRevealState = 'entering';
        // Covers stylesheet failure/cancellation without leaving animation styles.
        running.set(
          element,
          setTimeout(() => finish(element), 1200 + delay),
        );
      }
    },
    { threshold: 0, rootMargin: '0px 0px -5% 0px' },
  );

  doc.addEventListener('focusin', revealFocused, true);
  doc.addEventListener('animationend', onAnimationEnd);
  doc.addEventListener('animationcancel', onAnimationEnd);
  media.addEventListener('change', stopMotion);
  window.addEventListener('hashchange', revealHash);
  window.addEventListener('pageshow', restore);
  window.addEventListener('pagehide', onPageHide);
  doc.addEventListener('astro:before-swap', cleanup, { once: true });

  targets.forEach((element) => {
    const style = getComputedStyle(element);
    if (
      inView(element) ||
      element.getBoundingClientRect().bottom <= 0 ||
      element.contains(doc.activeElement) ||
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.animationName !== 'none'
    ) {
      finish(element);
      return;
    }
    const declared = element.dataset.reveal;
    const kind = ['heading', 'card', 'media', 'copy'].includes(declared || '')
      ? declared
      : element.matches('img, figure')
        ? 'media'
        : element.matches('h1,h2,h3,header,.section-heading')
          ? 'heading'
          : element.matches('a,article,li,details,.value')
            ? 'card'
            : 'copy';
    element.dataset.dnrRevealKind = kind;
    element.style.setProperty('--dnr-reveal-opacity', style.opacity);
    element.classList.add('dnr-reveal');
    element.dataset.dnrRevealState = 'pending';
    pending.add(element);
    observer!.observe(element);
  });
  revealHash();
  return cleanup;
}
