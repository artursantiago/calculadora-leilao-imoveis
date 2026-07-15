// Cálculo da parcela do financiamento (Tabela Price).

/** Converte taxa nominal anual (%) em taxa efetiva mensal (fração). */
export function monthlyRateFromAnnual(annualPercent: number): number {
  return Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
}

/**
 * Parcela fixa da Tabela Price.
 * PMT = PV·i / (1 − (1+i)^−n)
 */
export function pmt(pv: number, monthlyRate: number, months: number): number {
  if (months <= 0 || pv <= 0) return 0;
  if (monthlyRate === 0) return pv / months;
  return (pv * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

interface ParcelaInput {
  parcela: number | null;
  valorFinanciado: number;
  taxaJurosAnual: number | null;
  prazoMeses: number;
}

/**
 * Resolve a parcela mensal:
 * - se informada explicitamente, usa-a;
 * - caso contrário calcula via Tabela Price a partir da taxa anual e do prazo;
 * - se não houver dados suficientes, retorna 0.
 */
export function resolveParcela({
  parcela,
  valorFinanciado,
  taxaJurosAnual,
  prazoMeses,
}: ParcelaInput): number {
  if (parcela !== null && parcela > 0) return parcela;
  if (taxaJurosAnual === null || prazoMeses <= 0 || valorFinanciado <= 0) return 0;
  return pmt(valorFinanciado, monthlyRateFromAnnual(taxaJurosAnual), prazoMeses);
}
