export type EstimateInput = {
  operation: string;
  transport: string;
  regime: string;
  specialCargo: boolean;
  documentReview: boolean;
  classification: boolean;
};
export const money = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
export const transportLabel = (value: string) =>
  ({ Marítimo: 'marítima', Aéreo: 'aérea', Terrestre: 'terrestre', 'Por definir': 'por definir' })[
    value
  ] || value.toLowerCase();
export function calculateEstimate(input: EstimateInput) {
  const base = input.operation === 'Exportación' ? 3200 : 3800;
  const transport: Record<string, number> = { Marítimo: 1600, Aéreo: 1000, Terrestre: 700 };
  const specialized =
    input.specialCargo || input.regime !== 'Definitivo' || !(input.transport in transport);
  const lines = [
    { label: `Gestión de ${input.operation.toLowerCase()}`, amount: base },
    {
      label: `Coordinación ${transportLabel(input.transport)}`,
      amount: transport[input.transport] || 0,
    },
  ];
  if (input.documentReview) lines.push({ label: 'Revisión documental adicional', amount: 900 });
  if (input.classification) lines.push({ label: 'Clasificación preliminar', amount: 1200 });
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return {
    low: Math.ceil(total / 100) * 100,
    high: Math.ceil((total * 1.25) / 100) * 100,
    specialized,
    lines,
  };
}
