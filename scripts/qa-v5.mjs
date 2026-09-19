import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const b = await chromium.launch({ channel: 'msedge', headless: true });
const report = { checks: [], errors: [], axe: [] };
const check = (name, pass, evidence) => {
  report.checks.push({ name, pass, evidence });
  console.log(name, pass ? 'PASS' : 'FAIL', evidence ?? '');
};
try {
  for (const [width, height] of [
    [1440, 1000],
    [1920, 1080],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [360, 740],
    [844, 390],
  ]) {
    const c = await b.newContext({ viewport: { width, height } }),
      p = await c.newPage();
    p.on('pageerror', (e) => report.errors.push({ width, error: e.message }));
    await p.goto('http://localhost:4324/', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(350);
    check(
      `body overflow ${width}`,
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    );
    for (const phase of height < 600 ? [0] : [0, 1, 2]) {
      await p.evaluate((n) => {
        const e = document.querySelector('#voyage');
        scrollTo({ top: ((e.offsetHeight - innerHeight) * n) / 2, behavior: 'instant' });
      }, phase);
      await p.waitForTimeout(700);
      const geom = await p.evaluate(() => {
        const active = document.querySelector('.hero-copy.is-active');
        const r = active.querySelector('.hero-actions').getBoundingClientRect(),
          s = document.querySelector('.scroll-prompt').getBoundingClientRect();
        const els = [...active.querySelectorAll('h1 span,h2 span')].map((e) => {
          const range = document.createRange();
          range.selectNodeContents(e);
          return range.getBoundingClientRect().right;
        });
        return {
          overlap: !(r.bottom < s.top || r.top > s.bottom || r.right < s.left || r.left > s.right),
          textFits: els.every((x) => x <= innerWidth),
          top: active.getBoundingClientRect().top,
        };
      });
      check(`hero ${width} phase ${phase} spacing`, !geom.overlap && geom.textFits, geom);
      if (phase === 0 && [1440, 390, 768, 360].includes(width))
        await p.screenshot({ path: `artifacts/v5-hero-${width}.png` });
    }
    for (const selector of [
      '#colaboraciones',
      '.operations-editorial',
      '#soluciones',
      '#recorrido',
      '.coverage',
      '#criterios-de-ruta',
      '#ruta-documental',
      '#cotizador',
      '.closing-banner',
      '#contacto',
    ]) {
      const loc = p.locator(selector);
      await loc.evaluate((e) =>
        scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: 'instant' }),
      );
      await p.waitForTimeout(1000);
      if ([1440, 390].includes(width))
        await p.screenshot({
          path: `artifacts/v5-${selector.replace(/[^a-z]/g, '')}-${width}.png`,
        });
    }
    await p.evaluate(() =>
      scrollTo({
        top: document.querySelector('#preguntas').getBoundingClientRect().top + scrollY,
        behavior: 'instant',
      }),
    );
    await p.waitForTimeout(450);
    await p.evaluate(() => scrollBy({ top: 200, behavior: 'instant' }));
    await p.waitForTimeout(450);
    check(
      `header deep hides ${width}`,
      await p.locator('.site-header').evaluate((e) => e.getBoundingClientRect().bottom < 0),
    );
    await p.evaluate(() => scrollBy({ top: -80, behavior: 'instant' }));
    await p.waitForTimeout(450);
    check(
      `header deep returns ${width}`,
      await p.locator('.site-header').evaluate((e) => e.getBoundingClientRect().top >= 0),
    );
    if ([1440, 390].includes(width)) {
      const a = await new AxeBuilder({ page: p })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      report.axe.push({
        width,
        violations: a.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
      });
    }
    await c.close();
  }
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }),
    p = await c.newPage();
  for (const path of [
    '/servicios/',
    '/servicios/despacho-aduanal/',
    '/servicios/logistica-internacional/',
    '/servicios/consultoria-aduanera/',
    '/servicios/coordinacion-de-carga/',
    '/nosotros/',
    '/cobertura/',
    '/contacto/',
    '/recursos/',
    '/recursos/primera-importacion/',
    '/recursos/documentos-para-cotizar/',
    '/recursos/maritimo-aereo-terrestre/',
    '/privacidad/',
    '/terminos/',
    '/creditos/',
    '/404.html',
  ]) {
    const r = await p.goto('http://localhost:4324' + path);
    await p.evaluate(() => document.fonts.ready);
    check(
      `page ${path}`,
      r.status() === 200 &&
        (await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)),
    );
  }
  await c.close();
} catch (e) {
  report.errors.push(String(e.stack));
  console.error(e);
} finally {
  await fs.writeFile('artifacts/qa-v5.json', JSON.stringify(report, null, 2));
  await b.close();
}
if (
  report.checks.some((x) => !x.pass) ||
  report.errors.length ||
  report.axe.some((x) => x.violations.length)
)
  process.exitCode = 1;
