import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// All submission requests are intercepted. This script sends no email.
const base = process.env.QA_BASE_URL || 'http://localhost:4324';
const output = resolve('artifacts');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = { checks: [], viewports: [], pageErrors: [], requests: [], accessibility: [] };
const context = await browser.newContext({ reducedMotion: 'reduce' });
let unexpectedSubmissions = 0;
await context.route('https://api.web3forms.com/**', (route) => {
  unexpectedSubmissions++;
  return route.abort();
});
const page = await context.newPage();
page.on('pageerror', (error) => report.pageErrors.push(error.message));

try {
  for (const [width, height] of [
    [1440, 1000],
    [768, 1024],
    [360, 800],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${base}/contacto/`, { waitUntil: 'networkidle' });
    const form = page.locator('[data-contact-form]');
    await form.locator('[type="submit"]').waitFor();
    assert.equal(await form.getAttribute('data-web3-key'), '');
    assert.equal(await form.locator('[type="submit"]').isDisabled(), true);
    assert.match(await form.locator('[data-contact-status]').innerText(), /aún no está habilitado/);
    const map = page.locator('[data-cdmx-map]');
    assert.equal(await map.locator('[data-customs-facility]').count(), 5);
    assert.equal(await map.locator('[data-customs-cluster]').count(), 2);
    const selectedName = () => map.locator('[data-customs-panel]:not([hidden]) h3').innerText();
    await map.locator('[data-customs-facility="1"]').click();
    assert.equal(await selectedName(), 'Sección de contenedores');
    await map.locator('[data-customs-facility="1"]').press('ArrowDown');
    assert.equal(await selectedName(), 'Aduana del AICM');
    await map.locator('[data-customs-facility="2"]').press('End');
    assert.equal(await selectedName(), 'Centro Postal Mecanizado');
    await map.locator('[data-customs-facility="4"]').press('Home');
    assert.equal(await selectedName(), 'Aduana de México');
    await map.locator('[data-customs-cluster="aicm"]').click();
    assert.equal(await selectedName(), 'Aduana del AICM');
    await map.locator('[data-customs-cluster="aicm"]').press('ArrowLeft');
    assert.equal(await selectedName(), 'Aduana de México');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, `Horizontal overflow at ${width}px`);
    await page.evaluate(() => {
      document.activeElement?.blur();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(150);
    await page.screenshot({ path: resolve(output, `contact-v3-${width}.png`), fullPage: true });
    report.viewports.push({ width, height, overflow, keyboardMap: true, noKeyDisabled: true });
    if (width === 1440 || width === 360) {
      const axe = await new AxeBuilder({ page })
        .include('[data-contact-form]')
        .include('[data-cdmx-map]')
        .analyze();
      report.accessibility.push({
        width,
        violations: axe.violations.map(({ id, impact, nodes }) => ({
          id,
          impact,
          selectors: nodes.map((node) => node.target),
        })),
      });
      assert.equal(axe.violations.length, 0, `Accessibility issues at ${width}px`);
    }
  }
  assert.equal(unexpectedSubmissions, 0);
  report.checks.push(
    'Empty key: no requests, disabled submit and honest status at all three widths.',
    'Map: click, arrow keys and Home update the selected reference.',
    'Contact and map: no axe violations or horizontal overflow.',
  );

  const mockContext = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 900 },
  });
  await mockContext.route('**/contacto/', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /data-web3-key(?:="[^"]*")?(?=\s|>)/g,
      'data-web3-key="qa-key-not-a-real-account"',
    );
    await route.fulfill({ response, body });
  });
  let responseMode = 'rejected';
  await mockContext.route('https://api.web3forms.com/**', async (route) => {
    const payload = route.request().postDataJSON();
    assert.equal(payload.access_key, 'qa-key-not-a-real-account');
    assert.equal(payload.email, 'qa@example.test');
    assert.equal(payload.botcheck, '');
    report.requests.push({ mode: responseMode, validPayload: true, interest: payload.interes });
    if (responseMode === 'timeout') return;
    if (responseMode === 'offline') return route.abort('failed');
    await new Promise((done) => setTimeout(done, 200));
    return route.fulfill({
      status: responseMode === 'limited' ? 429 : 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: responseMode === 'success' }),
    });
  });
  const mock = await mockContext.newPage();
  mock.on('pageerror', (error) => report.pageErrors.push(error.message));
  await mock.goto(`${base}/contacto/`, { waitUntil: 'networkidle' });
  const form = mock.locator('[data-contact-form]');
  const submit = form.locator('[type="submit"]');
  const status = form.locator('[data-contact-status]');
  await submit.click();
  assert.equal(await form.locator('[aria-invalid="true"]').count(), 5);
  assert.equal(report.requests.length, 0);
  assert.equal(
    await form.locator('[name="name"]').evaluate((element) => element === document.activeElement),
    true,
  );
  const fill = async () => {
    await form.locator('[name="name"]').fill('Persona de prueba');
    await form.locator('[name="email"]').fill('qa@example.test');
    await form.locator('[name="company"]').fill('Empresa de prueba');
    await form.locator('[name="interest"]').selectOption('Mi primera importación');
    await form
      .locator('[name="message"]')
      .fill('Quiero conocer los pasos para preparar mi primera operación.');
    await form.locator('[name="consent"]').check();
  };
  await fill();
  await form.locator('[name="botcheck"]').evaluate((element) => {
    element.checked = true;
  });
  await submit.click();
  assert.equal(report.requests.length, 0);
  assert.match(await status.innerText(), /No se pudo validar/);
  await form.locator('[name="botcheck"]').evaluate((element) => {
    element.checked = false;
  });
  report.checks.push(
    'Required fields validate in Spanish, focus moves to the first error, and honeypot blocks submission.',
  );

  await submit.click();
  assert.equal(await submit.isDisabled(), true);
  await status.filter({ hasText: 'No pudimos confirmar' }).waitFor();
  assert.equal(await submit.isDisabled(), false);
  assert.equal(await form.locator('[name="message"]').isEnabled(), true);
  assert.equal(await form.locator('[name="email"]').inputValue(), 'qa@example.test');
  responseMode = 'success';
  await submit.click();
  await status.filter({ hasText: 'aceptado por el servicio' }).waitFor();
  assert.equal(await submit.isDisabled(), true);
  assert.equal(await form.locator('[name="name"]').isDisabled(), true);
  await form.locator('[data-contact-reset]').click();
  assert.equal(await form.locator('[name="name"]').inputValue(), '');
  assert.equal(await submit.isEnabled(), true);
  report.checks.push(
    'HTTP 200 with success:false is treated as failure; fields survive; retry success is acknowledged only with success:true.',
    'Successful submission locks the original message; writing another message resets and enables fields.',
  );

  await fill();
  responseMode = 'limited';
  await submit.click();
  await status.filter({ hasText: 'límite temporal' }).waitFor();
  responseMode = 'offline';
  await submit.click();
  await status.filter({ hasText: 'No pudimos confirmar' }).waitFor();
  responseMode = 'timeout';
  await submit.click();
  await status.filter({ hasText: 'tardando más' }).waitFor({ timeout: 25000 });
  assert.equal(await submit.isEnabled(), true);
  assert.equal(await form.locator('[name="email"]').inputValue(), 'qa@example.test');
  report.checks.push(
    '429, network failure and the real 20-second timeout show retryable states without clearing input.',
  );
  assert.equal(report.pageErrors.length, 0);
  await mockContext.close();
  report.passed = true;
} finally {
  await writeFile(resolve(output, 'contact-v3-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
