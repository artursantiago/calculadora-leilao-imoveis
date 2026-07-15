import type { Classification, ClassColor, FormState } from './types';

// ---------------------------------------------------------------------------
// Percentuais padrão (editáveis no formulário — princípio de parametrização).
// ---------------------------------------------------------------------------
export const DEFAULTS = {
  comissaoPct: 5,
  assessoriaPct: 15,
  itbiPct: 3,
  entradaPct: 20,
  prazoMeses: 420,
  administracaoPct: 10,
  vacanciaPct: 5,
} as const;

export const defaultFormState: FormState = {
  arrematacao: 0,
  avaliacaoBanco: 0,
  valorMercado: null,
  area: 0,

  comissao: { mode: 'percent', value: DEFAULTS.comissaoPct },
  assessoria: { mode: 'percent', value: DEFAULTS.assessoriaPct },
  reforma: 0,
  desocupacao: 0,
  itbi: { mode: 'percent', value: DEFAULTS.itbiPct },
  registro: 0,
  outros: 0,

  paymentMode: 'financed',
  entrada: { mode: 'percent', value: DEFAULTS.entradaPct },
  prazoMeses: DEFAULTS.prazoMeses,
  taxaJurosMensal: null,
  parcela: null,

  aluguel: 0,
  administracao: DEFAULTS.administracaoPct,
  condominio: 0,
  iptu: 0,
  seguro: 0,
  reservaManutencao: { mode: 'value', value: 0 },
  vacancia: DEFAULTS.vacanciaPct,
  primeiroAluguelImobiliaria: true,
};

// ---------------------------------------------------------------------------
// Faixas de classificação. Cada faixa tem um limite inferior inclusivo (`min`).
// As faixas são avaliadas da maior para a menor: a primeira em que
// `valor >= min` define a classificação.
// ---------------------------------------------------------------------------
interface Range extends Classification {
  min: number;
}

// Yield bruto mensal — comparado em PONTOS PERCENTUAIS (ex.: 1.0 = 1,00%).
export const YIELD_RANGES: Range[] = [
  { min: 1.0, label: 'Excelente', emoji: '🟢', color: 'green' },
  { min: 0.8, label: 'Muito Bom', emoji: '🟢', color: 'green' },
  { min: 0.7, label: 'Bom', emoji: '🟡', color: 'yellow' },
  { min: 0.6, label: 'Atenção', emoji: '🟠', color: 'orange' },
  { min: -Infinity, label: 'Ruim', emoji: '🔴', color: 'red' },
];

// Fluxo de caixa mensal — comparado em R$.
export const CASH_FLOW_RANGES: Range[] = [
  { min: 300, label: 'Excelente', emoji: '🟢', color: 'green' },
  { min: 100, label: 'Bom', emoji: '🟢', color: 'green' },
  { min: -100, label: 'Neutro', emoji: '🟡', color: 'yellow' },
  { min: -300, label: 'Atenção', emoji: '🟠', color: 'orange' },
  { min: -Infinity, label: 'Ruim', emoji: '🔴', color: 'red' },
];

// Desconto — comparado em PONTOS PERCENTUAIS (ex.: 20 = 20%).
export const DISCOUNT_RANGES: Range[] = [
  { min: 20, label: 'Excelente', emoji: '🟢', color: 'green' },
  { min: 15, label: 'Muito Bom', emoji: '🟢', color: 'green' },
  { min: 10, label: 'Bom', emoji: '🟡', color: 'yellow' },
  { min: 5, label: 'Atenção', emoji: '🟠', color: 'orange' },
  { min: -Infinity, label: 'Pequeno', emoji: '🔴', color: 'red' },
];

// Índice de Cobertura da Parcela (ICP) — razão receita líquida / parcela.
export const ICP_RANGES: Range[] = [
  { min: 1.1, label: 'Excelente', emoji: '🟢', color: 'green' },
  { min: 1.0, label: 'Bom', emoji: '🟢', color: 'green' },
  { min: 0.9, label: 'Aceitável', emoji: '🟡', color: 'yellow' },
  { min: 0.8, label: 'Atenção', emoji: '🟠', color: 'orange' },
  { min: -Infinity, label: 'Ruim', emoji: '🔴', color: 'red' },
];

// Classes utilitárias Tailwind por cor (badges).
export const COLOR_CLASSES: Record<ClassColor, string> = {
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  yellow: 'bg-amber-100 text-amber-800 border-amber-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  red: 'bg-red-100 text-red-800 border-red-200',
};
