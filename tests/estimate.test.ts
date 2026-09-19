import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEstimate } from '../src/scripts/estimate.ts';
const normal = {
  operation: 'Importación',
  transport: 'Marítimo',
  regime: 'Definitivo',
  specialCargo: false,
  documentReview: false,
  classification: false,
};
test('normal import shows a rounded service-only range', () => {
  const quote = calculateEstimate(normal);
  assert.equal(quote.low, 5400);
  assert.equal(quote.high, 6800);
  assert.equal(quote.specialized, false);
  assert.equal(quote.lines.length, 2);
});
test('export and selected services preserve itemized totals', () => {
  const quote = calculateEstimate({
    ...normal,
    operation: 'Exportación',
    transport: 'Terrestre',
    documentReview: true,
    classification: true,
  });
  assert.equal(
    quote.lines.reduce((sum, l) => sum + l.amount, 0),
    6000,
  );
  assert.equal(quote.low, 6000);
  assert.equal(quote.high, 7500);
});
test('uncertain route, special cargo and non-definitive regimes require manual review', () => {
  for (const variant of [
    { transport: 'Por definir' },
    { specialCargo: true },
    { regime: 'Temporal' },
    { regime: 'Por definir' },
  ])
    assert.equal(calculateEstimate({ ...normal, ...variant }).specialized, true);
});
