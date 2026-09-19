import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { downloadQuotePDF } from '../src/scripts/pdf.ts';
import { calculateEstimate } from '../src/scripts/estimate.ts';

// This deterministic QA uses only local font files and never sends a form request.
const project = path.resolve(import.meta.dirname, '..');
let fontRequests = 0;
globalThis.fetch = async (url) => {
  assert.match(String(url), /^\/fonts\/pdf\/[A-Za-z-]+\.ttf$/);
  fontRequests += 1;
  return new Response(await fs.readFile(path.join(project, 'public', String(url))));
};
const snapshot = {
  reference: 'DNR-V3-20260917-ED01',
  date: '17 de septiembre de 2026, 16:30 h',
  name: 'María José Núñez',
  company: 'Comercializadora Horizonte, S.A. de C.V.',
  email: 'operaciones@example.com',
  phone: '+52 55 1234 5678',
  operation: 'Importación',
  transport: 'Marítimo',
  origin: 'Valencia, España',
  destination: 'Ciudad de México',
  customsOffice: 'Manzanillo',
  description:
    '100 sillas de acero para oficina, con asiento tapizado y respaldo ergonómico. Mercancía nueva para distribución comercial.',
  declaredValue: '25000.50',
  currency: 'USD',
  weight: '512.25',
  volume: '2.755',
  packages: '100',
  incoterm: 'FOB',
  regime: 'Definitivo',
  tariffCode: '94013999',
  nico: '00',
  notes:
    'Entrega con cita. Proteger de humedad y golpes durante el traslado. Referencia interna: HORIZONTE-MX-017.',
  firstOperation: 'Sí',
  dateNeeded: '2026-11-15',
  services: [
    'Gestión aduanal',
    'Coordinación marítima',
    'Revisión documental adicional',
    'Análisis preliminar de clasificación',
  ],
  estimate: calculateEstimate({
    operation: 'Importación',
    transport: 'Marítimo',
    regime: 'Definitivo',
    specialCargo: false,
    documentReview: true,
    classification: true,
  }),
};
const repeated = (text, limit, marker) =>
  `${text.repeat(Math.ceil(limit / text.length)).slice(0, limit)} ${marker}`;
const fixtures = {
  normal: structuredClone(snapshot),
  especializada: {
    ...structuredClone(snapshot),
    reference: 'DNR-V3-ESPECIALIZADA',
    transport: 'Por definir',
    regime: 'Temporal',
    notes: 'Carga de equipo temporal con requisitos que debe confirmar un especialista.',
    estimate: {
      specialized: true,
      low: 999999,
      high: 9999999,
      lines: [{ label: 'ESTE_IMPORTE_NO_DEBE_APARECER', amount: 876543 }],
    },
  },
  extensa: {
    ...structuredClone(snapshot),
    reference: 'DNR-V3-EXTENSA',
    name: repeated('María José Núñez ', 95, 'FIN-NOMBRE'),
    company: repeated('Comercializadora Horizonte México ', 130, 'FIN-EMPRESA'),
    description: repeated(
      'Descripción técnica: sillas ergonómicas de acero con acabado protector y asientos tapizados. ',
      895,
      'FIN-DESCRIPCION',
    ),
    notes: repeated(
      'Verificar embalaje, cantidades y entrega con cita. Evitar humedad, documentar revisiones y coordinar maniobras. ',
      1190,
      'FIN-NOTAS',
    ),
    estimate: {
      ...snapshot.estimate,
      lines: [
        {
          label: repeated(
            'Concepto ampliado de revisión documental y coordinación operativa. ',
            3400,
            'FIN-CONCEPTO',
          ),
          amount: 7500,
        },
      ],
    },
  },
};
const report = { date: new Date().toISOString(), fontsFetched: 0, samples: [] };
await fs.mkdir(path.join(project, 'artifacts'), { recursive: true });
for (const [name, quote] of Object.entries(fixtures)) {
  const before = JSON.stringify(quote);
  const pdf = await downloadQuotePDF(quote, false);
  assert.equal(JSON.stringify(quote), before, 'PDF export must not mutate the shared snapshot');
  const file = path.join(project, 'artifacts', `pdf-v3-${name}.pdf`);
  await fs.writeFile(file, new Uint8Array(pdf.output('arraybuffer')));
  report.samples.push({ name, pages: pdf.getNumberOfPages(), bytes: (await fs.stat(file)).size });
}
assert.equal(fontRequests, 3, 'Successful font fetches should be reused across downloads');
report.fontsFetched = fontRequests;
await fs.writeFile(
  path.join(project, 'artifacts', 'pdf-v3-fixtures.json'),
  JSON.stringify(fixtures, null, 2),
);
await fs.writeFile(
  path.join(project, 'artifacts', 'pdf-v3-report.json'),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
