const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const decimal2 = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimal1 = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Formata um número em Real (R$ 1.234,56). */
export function formatBRL(value: number): string {
  return brl.format(Number.isFinite(value) ? value : 0);
}

/** Formata uma fração (0.0123) como percentual "1,23%". */
export function formatPercentFromFraction(fraction: number): string {
  return `${decimal2.format((Number.isFinite(fraction) ? fraction : 0) * 100)}%`;
}

/** Formata um percentual já em pontos (12.5) como "12,50%". */
export function formatPercentValue(pct: number): string {
  return `${decimal2.format(Number.isFinite(pct) ? pct : 0)}%`;
}

/** Formata a alavancagem como "3,8x". */
export function formatLeverage(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${decimal1.format(value)}x`;
}

/** Formata o ICP como "1,20" (duas casas). */
export function formatRatio(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return decimal2.format(value);
}
