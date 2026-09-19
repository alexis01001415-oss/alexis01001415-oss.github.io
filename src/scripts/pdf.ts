/** Browser-only PDF export. jsPDF and the local TTF fonts load on demand. */
export interface QuoteSnapshot {
  reference: string;
  date: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  operation: string;
  transport: string;
  origin: string;
  destination: string;
  customsOffice: string;
  description: string;
  declaredValue: string;
  currency: string;
  weight: string;
  volume: string;
  packages: string;
  incoterm: string;
  regime: string;
  tariffCode: string;
  nico: string;
  notes: string;
  firstOperation: string;
  dateNeeded: string;
  services: string[];
  estimate: {
    low: number;
    high: number;
    specialized: boolean;
    lines: { label: string; amount: number }[];
  };
}

type PDF = import('jspdf').jsPDF;
type RGB = [number, number, number];
type Field = readonly [label: string, value: string];
const COLORS = {
  ink: [13, 27, 42] as RGB,
  navy: [27, 38, 59] as RGB,
  slate: [65, 90, 119] as RGB,
  steel: [119, 141, 169] as RGB,
  paper: [224, 225, 221] as RGB,
  white: [255, 255, 255] as RGB,
};
const FONTS = [
  ['DMSans-Regular.ttf', 'DMSans', 'normal'],
  ['DMSans-SemiBold.ttf', 'DMSans', 'bold'],
  ['SpaceGrotesk-SemiBold.ttf', 'SpaceGrotesk', 'normal'],
] as const;
let fontFiles: Promise<string[]> | null = null;

/** Cache successful requests; a failed request can be retried by the visitor. */
function loadFontFiles() {
  if (!fontFiles) {
    fontFiles = Promise.all(
      FONTS.map(async ([file]) => {
        const response = await fetch(`/fonts/pdf/${file}`, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error(`Could not load PDF font: ${file}`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        let binary = '';
        for (let offset = 0; offset < bytes.length; offset += 8192) {
          binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
        }
        return btoa(binary);
      }),
    ).catch((error) => {
      fontFiles = null;
      throw error;
    });
  }
  return fontFiles;
}

/** Preserve every glyph supported by DM Sans; visibly mark unsupported scripts. */
function pdfText(input: unknown, glyphs: Set<number>, markReplacement: () => void): string {
  const punctuation: Record<string, string> = {
    '\u2010': '-',
    '\u2011': '-',
    '\u2012': '-',
    '\u2013': '-',
    '\u2014': '-',
    '\u2212': '-',
    '\u2018': "'",
    '\u2019': "'",
    '\u201a': "'",
    '\u201c': '"',
    '\u201d': '"',
    '\u201e': '"',
    '\u2026': '...',
    '\u00a0': ' ',
    '\u202f': ' ',
    '\u2009': ' ',
    '\u2192': ' -> ',
    '\u2190': ' <- ',
    '\u2713': 'Sí',
  };
  return Array.from(String(input ?? '').normalize('NFC'))
    .map((character) => {
      if (punctuation[character] !== undefined) return punctuation[character];
      const code = character.codePointAt(0)!;
      if (character === '\n' || character === '\t') return character === '\t' ? ' ' : '\n';
      if (code < 32 || (code >= 127 && code <= 159)) return '';
      if (glyphs.has(code)) return character;
      const transliterated = character.normalize('NFKD').replace(/\p{M}/gu, '');
      markReplacement();
      return Array.from(transliterated).every((letter) => glyphs.has(letter.codePointAt(0)!))
        ? transliterated
        : '[?]';
    })
    .join('')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

export async function downloadQuotePDF(quote: QuoteSnapshot, download = true): Promise<PDF> {
  const [{ jsPDF }, files] = await Promise.all([import('jspdf'), loadFontFiles()]);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
  });
  FONTS.forEach(([file, family, style], index) => {
    doc.addFileToVFS(file, files[index]!);
    doc.addFont(file, family, style);
  });
  doc.setFont('DMSans', 'normal');
  const metadata = doc.getFont().metadata as {
    cmap?: { unicode?: { codeMap?: Record<string, number> } };
  };
  const glyphs = new Set(Object.keys(metadata.cmap?.unicode?.codeMap ?? {}).map(Number));
  if (!glyphs.has(65)) throw new Error('PDF font registration failed');
  const pageWidth = 210,
    margin = 20,
    contentWidth = 170,
    contentBottom = 275,
    leading = 5.15;
  let cursor = 77;
  let replacedCharacters = false;
  const clean = (value: unknown) =>
    pdfText(value, glyphs, () => {
      replacedCharacters = true;
    });
  const display = (value: unknown) => clean(value) || 'Por definir';
  const currency = (value: number) =>
    !Number.isFinite(value)
      ? 'Por definir'
      : Math.max(0, value) >= 1e12
        ? `$${Math.max(0, value).toExponential(3)}`
        : `$${Math.max(0, value).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
  doc.setProperties({
    title: clean(`DUANOR - Ficha de operación ${quote.reference}`),
    subject: 'Demostración de cotizador de servicios aduanales',
    author: 'DUANOR - Marca ficticia',
    creator: 'DUANOR',
    keywords: 'DUANOR, demostración, operación, servicios aduanales',
  });
  const font = (size: number, weight: 'normal' | 'bold' = 'normal', color: RGB = COLORS.ink) => {
    doc.setFont('DMSans', weight);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setCharSpace(0);
  };
  const headline = (size: number, color: RGB = COLORS.ink) => {
    doc.setFont('SpaceGrotesk', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setCharSpace(0);
  };
  const fitHeader = (value: string, width: number) => {
    let text = clean(value);
    if (doc.getTextWidth(text) <= width) return text;
    while (text.length && doc.getTextWidth(`${text}...`) > width) text = text.slice(0, -1);
    return `${text}...`;
  };
  const header = (initial = false) => {
    doc.setFillColor(...COLORS.ink);
    doc.rect(0, 0, pageWidth, initial ? 65 : 31, 'F');
    doc.setFillColor(...COLORS.steel);
    const y = initial ? 13 : 11;
    doc.triangle(margin, y, margin + 7, y, margin, y + 7, 'F');
    doc.triangle(margin + 8, y + 1, margin + 8, y + 8, margin + 1, y + 8, 'F');
    headline(initial ? 17 : 15, COLORS.white);
    doc.text('DUANOR', margin + 13, y + 6.8);
    font(7, 'bold', COLORS.paper);
    doc.text('DEMOSTRACIÓN', pageWidth - margin, initial ? 18 : 14, { align: 'right' });
    if (initial) {
      headline(27, COLORS.white);
      doc.text('Tu operación, en claro.', margin, 46);
      font(9, 'normal', COLORS.paper);
      doc.text('Una ficha para entender tu siguiente movimiento.', margin, 57);
    } else {
      font(7.2, 'normal', COLORS.paper);
      doc.text(fitHeader(quote.reference, 81), pageWidth - margin, 23, { align: 'right' });
    }
  };
  const nextPage = () => {
    doc.addPage();
    header();
    cursor = 44;
  };
  const ensure = (height: number) => {
    if (cursor + height > contentBottom) nextPage();
  };
  const section = (number: string, title: string, minimumContent = 23) => {
    ensure(23 + minimumContent);
    font(8, 'bold', COLORS.slate);
    doc.text(number, margin, cursor + 6.8);
    headline(18);
    doc.text(clean(title), margin + 13, cursor + 8);
    cursor += 21;
  };
  /** Keep two-column rows aligned; continue complete values on following pages. */
  const fields = (entries: readonly Field[]) => {
    const gap = entries.length === 2 ? 12 : 0;
    const width = (contentWidth - gap) / entries.length;
    font(10);
    const lines = entries.map(
      ([, value]) => doc.splitTextToSize(display(value), width - 2) as string[],
    );
    const maximum = Math.max(...lines.map((cell) => cell.length));
    let offset = 0;
    while (offset < maximum) {
      ensure(22);
      const capacity = Math.max(1, Math.floor((contentBottom - cursor - 12) / leading));
      const count = Math.min(maximum - offset, capacity);
      const height = 12 + count * leading;
      entries.forEach(([label], index) => {
        const x = margin + index * (width + gap);
        font(7.1, 'bold', COLORS.slate);
        doc.text(clean(label.toUpperCase()) + (offset ? ' / CONTINUACIÓN' : ''), x, cursor + 3.2);
        font(10);
        lines[index].slice(offset, offset + count).forEach((line, lineIndex) => {
          doc.text(line, x, cursor + 10.4 + lineIndex * leading);
        });
        doc.setDrawColor(...COLORS.paper);
        doc.setLineWidth(0.35);
        doc.line(x, cursor + height, x + width, cursor + height);
      });
      cursor += height + 5;
      offset += count;
      if (offset < maximum) nextPage();
    }
  };
  const paragraph = (
    value: string,
    options: { size?: number; color?: RGB; bold?: boolean; gap?: number } = {},
  ) => {
    const size = options.size ?? 9;
    const lineHeight = size * 0.3528 * 1.5;
    font(size, options.bold ? 'bold' : 'normal', options.color ?? COLORS.slate);
    const lines = doc.splitTextToSize(clean(value), contentWidth) as string[];
    for (const line of lines) {
      ensure(lineHeight + 1);
      font(size, options.bold ? 'bold' : 'normal', options.color ?? COLORS.slate);
      doc.text(line, margin, cursor + lineHeight - 1);
      cursor += lineHeight;
    }
    cursor += options.gap ?? 6;
  };

  // Page 1: context and route. The complete folio is in the body, not only the header.
  header(true);
  fields([
    ['Folio completo', quote.reference],
    ['Fecha de emisión', quote.date],
  ]);
  paragraph(
    'Los datos de tu proyecto, reunidos en un solo lugar. Esta referencia ilustrativa debe confirmarse con un especialista antes de iniciar la operación.',
    { size: 9 },
  );
  section('01', 'Ruta de la operación');
  fields([
    ['Tipo de operación', quote.operation],
    ['Modalidad de transporte', quote.transport],
  ]);
  fields([
    ['País / lugar de origen', quote.origin],
    ['Destino de la carga', quote.destination],
  ]);
  fields([
    ['Aduana prevista', quote.customsOffice],
    ['Fecha requerida', quote.dateNeeded],
  ]);
  fields([['Mercancía / descripción', quote.description]]);
  fields([['Notas de la operación', quote.notes || 'Sin comentarios adicionales.']]);

  // Deliberate editorial page break; extensive free text can create continuation pages.
  nextPage();
  section('02', 'Mercancía y alcance');
  fields([
    ['Valor comercial', `${display(quote.declaredValue)} ${clean(quote.currency)}`],
    ['Incoterm', quote.incoterm],
  ]);
  fields([
    ['Peso bruto (kg)', quote.weight],
    ['Volumen (m³)', quote.volume],
  ]);
  fields([
    ['Número de bultos', quote.packages],
    ['Régimen / primera operación', `${quote.regime} / Primera operación: ${quote.firstOperation}`],
  ]);
  fields([
    ['Fracción arancelaria', quote.tariffCode],
    ['NICO', quote.nico],
  ]);
  fields([
    ['Servicios solicitados', quote.services.length ? quote.services.join(', ') : 'Por definir'],
  ]);
  cursor += 7;
  section('03', 'Personas detrás del proyecto', 45);
  fields([
    ['Nombre', quote.name],
    ['Empresa', quote.company],
  ]);
  fields([
    ['Correo electrónico', quote.email],
    ['Teléfono', quote.phone],
  ]);

  nextPage();
  section('04', 'Referencia comercial');
  paragraph(
    'Honorarios ilustrativos en pesos mexicanos (MXN). Los conceptos corresponden a los datos capturados y requieren confirmación del alcance.',
    { size: 9 },
  );
  const tableHeader = () => {
    ensure(25);
    doc.setFillColor(...COLORS.navy);
    doc.rect(margin, cursor, contentWidth, 11, 'F');
    font(7.3, 'bold', COLORS.white);
    doc.text('CONCEPTO', margin + 5, cursor + 7);
    doc.text('REFERENCIA / MXN', pageWidth - margin - 5, cursor + 7, { align: 'right' });
    cursor += 11;
  };
  tableHeader();
  const estimateLines =
    quote.estimate.lines.length && !quote.estimate.specialized
      ? quote.estimate.lines
      : [{ label: 'Honorarios sujetos a revisión del alcance', amount: 0 }];
  for (const [index, item] of estimateLines.entries()) {
    font(9.5);
    const lines = doc.splitTextToSize(display(item.label), contentWidth - 60) as string[];
    let offset = 0;
    while (offset < lines.length) {
      if (cursor + 14 > contentBottom) {
        nextPage();
        tableHeader();
      }
      const capacity = Math.max(1, Math.floor((contentBottom - cursor - 8) / leading));
      const count = Math.min(lines.length - offset, capacity),
        height = 8 + count * leading;
      doc.setFillColor(...(index % 2 === 0 ? COLORS.paper : COLORS.white));
      doc.rect(margin, cursor, contentWidth, height, 'F');
      font(9.5);
      lines
        .slice(offset, offset + count)
        .forEach((line, lineIndex) =>
          doc.text(line, margin + 5, cursor + 7.7 + lineIndex * leading),
        );
      if (!offset) {
        font(9.5, 'bold');
        const amount =
          quote.estimate.lines.length && !quote.estimate.specialized
            ? currency(item.amount)
            : 'Por definir';
        doc.text(fitHeader(amount, 42), pageWidth - margin - 5, cursor + 7.7, { align: 'right' });
      }
      doc.setDrawColor(...COLORS.paper);
      doc.line(margin, cursor + height, pageWidth - margin, cursor + height);
      cursor += height;
      offset += count;
      if (offset < lines.length) {
        nextPage();
        tableHeader();
      }
    }
  }
  cursor += 11;
  const rangeLabel = quote.estimate.specialized
    ? 'OPERACIÓN SUJETA A REVISIÓN ESPECIALIZADA'
    : 'RANGO COMERCIAL ESTIMADO';
  const rangeValue = quote.estimate.specialized
    ? 'Revisión personalizada'
    : `${currency(quote.estimate.low)} - ${currency(quote.estimate.high)} MXN`;
  headline(23, COLORS.white);
  const rangeLines = doc.splitTextToSize(rangeValue, contentWidth - 16) as string[];
  const rangeHeight = 23 + rangeLines.length * 9;
  ensure(rangeHeight + 8);
  doc.setFillColor(...COLORS.navy);
  doc.rect(margin, cursor, contentWidth, rangeHeight, 'F');
  doc.setFillColor(...COLORS.steel);
  doc.rect(margin, cursor, 2, rangeHeight, 'F');
  font(7.4, 'bold', COLORS.paper);
  doc.text(rangeLabel, margin + 8, cursor + 9);
  headline(23, COLORS.white);
  rangeLines.forEach((line, index) => doc.text(line, margin + 8, cursor + 22 + index * 9));
  cursor += rangeHeight + 9;
  paragraph(
    'EXCLUSIONES: no incluye IGI, IVA, IEPS, DTA u otras contribuciones; IVA de los servicios; flete, seguro, almacenajes, demoras, maniobras, inspecciones, certificaciones, permisos ni gastos de terceros. Clasificación, origen y documentación determinan el alcance final.',
    { size: 8.1, color: COLORS.slate, gap: 8 },
  );
  section('05', 'Tu siguiente movimiento', 29);
  paragraph(
    '01. Reunir factura comercial, lista de empaque y documento de transporte.\n02. Confirmar clasificación, NICO, régimen y requisitos aplicables.\n03. Validar honorarios, gastos y alcance antes de iniciar.',
    { size: 9, color: COLORS.ink, gap: 7 },
  );
  paragraph(
    'El PDF se genera en tu dispositivo. Descargarlo no confirma un envío por correo: el formulario muestra por separado el estado real de la solicitud. Conserva el folio para dar seguimiento.',
    { size: 8, gap: 4 },
  );
  if (replacedCharacters) {
    paragraph(
      'Nota de caracteres: las fuentes incrustadas no cubren todos los alfabetos. Los caracteres no disponibles se transliteran o aparecen como [?]. Consulta los datos originales para su grafía exacta.',
      { size: 8 },
    );
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...COLORS.paper);
    doc.setLineWidth(0.4);
    doc.line(margin, 282, pageWidth - margin, 282);
    font(6.8, 'normal', COLORS.slate);
    doc.text('DUANOR / Agencia ficticia. Demostración sin validez contractual.', margin, 287);
    doc.text('Ciudad de México · Servicios aduanales', margin, 292);
    font(7.1, 'bold', COLORS.slate);
    doc.text(
      `${String(page).padStart(2, '0')} / ${String(pages).padStart(2, '0')}`,
      pageWidth - margin,
      292,
      { align: 'right' },
    );
  }
  doc.setPage(1);
  if (download) {
    const reference =
      clean(quote.reference)
        .replace(/[^A-Za-z0-9_-]/g, '-')
        .slice(0, 70) || 'operacion';
    doc.save(`DUANOR-${reference}.pdf`);
  }
  return doc;
}
