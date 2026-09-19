import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.env.QA_URL || 'http://localhost:4324';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { checks: [], errors: [] };
const check = (name, pass, evidence) => {
  report.checks.push({ name, pass, evidence });
  console.log(name, pass ? 'PASS' : 'FAIL', JSON.stringify(evidence));
};
try {
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
    [360, 740],
    [768, 1024],
    [844, 390],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', (e) => report.errors.push({ width, message: e.message }));
    await page.addInitScript(() => {
      window.__warehouseDraws = 0;
      for (const type of [WebGLRenderingContext, WebGL2RenderingContext]) {
        for (const method of ['drawElements', 'drawArrays', 'drawElementsInstanced']) {
          const original = type.prototype[method];
          if (!original) continue;
          type.prototype[method] = function (...args) {
            if (this.canvas.parentElement?.id === 'warehouse-canvas') window.__warehouseDraws++;
            return original.apply(this, args);
          };
        }
      }
    });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    const tour = page.locator('#warehouse-tour');
    const geom = await tour.evaluate((e) => ({
      y: e.getBoundingClientRect().top + scrollY,
      h: e.getBoundingClientRect().height,
    }));
    await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), geom.y);
    await page.waitForFunction(
      () => document.querySelector('#warehouse-tour')?.dataset.webgl === 'ready',
    );
    await page.waitForTimeout(900);
    const sceneBounds = await page.locator('#warehouse-canvas').boundingBox();
    check(
      `full viewport WebGL canvas at ${width}x${height}`,
      sceneBounds.width >= width * 0.99 && sceneBounds.height >= height * 0.99,
      sceneBounds,
    );
    for (const step of [0, 2, 5]) {
      await page.evaluate(
        ({ y, h, step }) =>
          scrollTo({ top: y + ((h - innerHeight) * step) / 5, behavior: 'instant' }),
        { ...geom, step },
      );
      await page.waitForTimeout(1350);
      await page.screenshot({ path: `artifacts/tour-${width}-${step}.png` });
      const active = await page
        .locator('[data-tour-jump][aria-pressed="true"]')
        .getAttribute('data-tour-jump');
      check(`tour ${width}px chapter ${step + 1}`, Number(active) === step, { active });
      const cameraProgress = Number(
        await page.locator('#warehouse-canvas').getAttribute('data-camera-progress'),
      );
      check(
        `camera reaches chapter ${step + 1} at ${width}`,
        Math.abs(cameraProgress - step) < 0.02,
        { cameraProgress },
      );
      const overlap = await page.evaluate((chapter) => {
        const navigation = document.querySelector('.warehouse-navigation').getBoundingClientRect();
        const heading = document
          .querySelector(`[data-tour-chapter="${chapter}"] h3`)
          .getBoundingClientRect();
        const card = document
          .querySelector(`[data-tour-chapter="${chapter}"] .warehouse-card`)
          .getBoundingClientRect();
        return {
          intersects:
            navigation.left < heading.right &&
            navigation.right > heading.left &&
            navigation.top < heading.bottom &&
            navigation.bottom > heading.top,
          navigation: { top: navigation.top, bottom: navigation.bottom },
          heading: { top: heading.top, bottom: heading.bottom },
          card: { top: card.top, bottom: card.bottom },
        };
      }, step);
      check(
        `chapter ${step + 1} title clears navigation at ${width}`,
        !overlap.intersects,
        overlap,
      );
      check(
        `chapter ${step + 1} complete card fits above navigation at ${width}`,
        overlap.card.top >= 0 && overlap.card.bottom <= overlap.navigation.top - 4,
        overlap.card,
      );
    }
    const samples = [];
    for (const step of [2.15, 2.28, 2.42]) {
      await page.evaluate(
        ({ y, h, step }) =>
          scrollTo({
            top: y + ((h - innerHeight) * step) / 5,
            behavior: 'instant',
          }),
        { ...geom, step },
      );
      await page.waitForFunction(
        (target) =>
          Math.abs(
            Number(document.querySelector('#warehouse-canvas').dataset.cameraProgress) - target,
          ) < 0.015,
        step,
      );
      samples.push(
        await page.evaluate(() => ({
          progress: Number(document.querySelector('#warehouse-canvas').dataset.cameraProgress),
          position: document.querySelector('#warehouse-canvas').dataset.cameraPosition,
          drawCalls: window.__warehouseDraws,
          chapter: document.querySelector('[data-tour-jump][aria-pressed="true"]').dataset.tourJump,
        })),
      );
    }
    check(
      `continuous real WebGL rendering within one chapter at ${width}`,
      samples.every(
        (sample, i) =>
          sample.chapter === '2' &&
          sample.progress % 1 > 0.1 &&
          (!i ||
            (sample.position !== samples[i - 1].position &&
              sample.drawCalls > samples[i - 1].drawCalls)),
      ),
      samples,
    );
    check(
      `no still-image replacement at ${width}`,
      (await page.locator('.warehouse-poster:visible').count()) === 0 &&
        (await page
          .locator('.warehouse-fallback')
          .evaluate((image) => getComputedStyle(image).opacity)) === '0',
    );
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    check(`no horizontal overflow ${width}`, !overflow);
    await page.locator('#warehouse-motion').click();
    check(
      `pause camera ${width}`,
      (await page.locator('#warehouse-motion').getAttribute('aria-pressed')) === 'true',
    );
    await page.locator('[data-tour-jump="1"]').click();
    await page.waitForTimeout(250);
    check(
      `chapter button ${width}`,
      (await page.locator('[data-tour-jump="1"]').getAttribute('aria-pressed')) === 'true',
    );
    await page.close();
  }
  const rotated = await browser.newPage({ viewport: { width: 390, height: 844 } });
  rotated.on('pageerror', (error) =>
    report.errors.push({ mode: 'orientation', message: error.message }),
  );
  await rotated.goto(base);
  await rotated.evaluate(() => document.fonts.ready);
  await rotated.locator('#warehouse-tour').evaluate((tour) =>
    scrollTo({
      top: tour.getBoundingClientRect().top + scrollY,
      behavior: 'instant',
    }),
  );
  await rotated.waitForFunction(
    () => document.querySelector('#warehouse-tour').dataset.webgl === 'ready',
  );
  await rotated.evaluate(() => {
    window.__tourCanvas = document.querySelector('#warehouse-canvas canvas');
  });
  await rotated.setViewportSize({ width: 844, height: 390 });
  await rotated.waitForFunction(
    () =>
      document.querySelector('#warehouse-canvas canvas').getBoundingClientRect().height ===
      innerHeight,
  );
  await rotated.locator('#warehouse-tour').evaluate((tour) =>
    scrollTo({
      top:
        tour.getBoundingClientRect().top +
        scrollY +
        (tour.getBoundingClientRect().height - innerHeight) * 0.47,
      behavior: 'instant',
    }),
  );
  await rotated.waitForFunction(
    () =>
      Math.abs(Number(document.querySelector('#warehouse-canvas').dataset.cameraProgress) - 2.35) <
      0.02,
  );
  check(
    'rotation preserves the same live WebGL canvas and fractional camera movement',
    await rotated.evaluate(
      () =>
        window.__tourCanvas === document.querySelector('#warehouse-canvas canvas') &&
        document.querySelector('#warehouse-tour').dataset.webgl === 'ready',
    ),
  );
  await rotated.screenshot({ path: 'artifacts/tour-orientation.png' });
  await rotated.evaluate(() => {
    window.__tourContextExtension = window.__tourCanvas
      .getContext('webgl2')
      .getExtension('WEBGL_lose_context');
    window.__tourContextExtension.loseContext();
  });
  await rotated.waitForFunction(
    () => document.querySelector('#warehouse-tour').dataset.webgl === 'lost',
  );
  check(
    'temporary context loss explains recovery',
    (await rotated.locator('#warehouse-status').textContent()).includes('RECUPERANDO'),
  );
  await rotated.waitForTimeout(250);
  await rotated.evaluate(() => window.__tourContextExtension.restoreContext());
  await rotated.waitForFunction(
    () => document.querySelector('#warehouse-tour').dataset.webgl === 'ready',
  );
  check(
    'WebGL context restores without replacing the canvas',
    await rotated.evaluate(
      () => window.__tourCanvas === document.querySelector('#warehouse-canvas canvas'),
    ),
  );
  await rotated.emulateMedia({ reducedMotion: 'reduce' });
  await rotated.waitForFunction(
    () => document.querySelectorAll('#warehouse-canvas canvas').length === 0,
  );
  check(
    'preference change disposes WebGL and returns six accessible chapters',
    (await rotated.locator('.warehouse-poster:visible').count()) === 6 &&
      (await rotated.locator('#warehouse-enable').isVisible()),
  );
  await rotated.close();
  const reduced = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  await reduced.goto(base);
  await reduced.waitForTimeout(700);
  check(
    'reduced motion uses six static chapters',
    (await reduced.locator('.warehouse-poster:visible').count()) === 6 &&
      (await reduced.locator('#warehouse-canvas canvas').count()) === 0,
  );
  await reduced.locator('#bodega-03').scrollIntoViewIfNeeded();
  await reduced.locator('#bodega-03 .warehouse-poster').evaluate((image) => image.decode());
  await reduced
    .locator('#bodega-03')
    .evaluate((chapter) =>
      scrollTo({ top: chapter.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }),
    );
  await reduced.screenshot({ path: 'artifacts/tour-reduced.png' });
  check(
    'reduced motion explains the static view and offers explicit 3D opt-in',
    (await reduced.locator('#warehouse-enable').isVisible()) &&
      (await reduced.locator('#warehouse-experience-message').textContent()).includes(
        'movimiento reducido',
      ),
  );
  await reduced.locator('#warehouse-enable').click();
  await reduced.waitForFunction(
    () => document.querySelector('#warehouse-tour').dataset.webgl === 'ready',
  );
  check(
    'reduced motion explicit opt-in activates real WebGL',
    (await reduced.locator('#warehouse-canvas canvas').count()) === 1 &&
      (await reduced.locator('.warehouse-poster:visible').count()) === 0,
  );
  await reduced.screenshot({ path: 'artifacts/tour-reduced-optin.png' });
  check(
    'explicit 3D opt-in aligns the scene with the viewport',
    Math.abs((await reduced.locator('#warehouse-tour').boundingBox()).y) < 2,
  );
  await reduced.close();
  const noGL = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await noGL.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.includes('webgl') ? null : get.call(this, type, ...args);
    };
  });
  await noGL.goto(base);
  await noGL.locator('#warehouse-tour').scrollIntoViewIfNeeded();
  await noGL.waitForFunction(
    () => document.querySelector('#warehouse-tour')?.dataset.webgl === 'unavailable',
  );
  check(
    'WebGL unavailable retains six static illustrated chapters',
    (await noGL.locator('.warehouse-poster:visible').count()) === 6 &&
      !(await noGL
        .locator('#warehouse-tour')
        .evaluate((tour) => tour.classList.contains('is-enhanced'))),
  );
  check(
    'unavailable WebGL explains the alternative',
    (await noGL.locator('#warehouse-experience-notice').isVisible()) &&
      (await noGL.locator('#warehouse-experience-message').textContent()).includes(
        'no está disponible',
      ),
  );
  await noGL.locator('#bodega-03').scrollIntoViewIfNeeded();
  await noGL.locator('#bodega-03 .warehouse-poster').evaluate((image) => image.decode());
  await noGL
    .locator('#bodega-03')
    .evaluate((chapter) =>
      scrollTo({ top: chapter.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }),
    );
  await noGL.screenshot({ path: 'artifacts/tour-no-webgl.png' });
  await noGL.close();
  const noJS = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await noJS.goto(base);
  check(
    'no JS retains all six chapters',
    (await noJS.locator('.warehouse-poster:visible').count()) === 6,
  );
  await noJS.close();
} catch (e) {
  report.errors.push({ fatal: String(e.stack || e) });
  console.error(e);
} finally {
  await fs.writeFile('artifacts/qa-tour.json', JSON.stringify(report, null, 2));
  await browser.close();
}
if (report.errors.length || report.checks.some((c) => !c.pass)) process.exitCode = 1;
