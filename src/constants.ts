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
  jurosMensalPct: 1,
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
  taxaJurosMensal: DEFAULTS.jurosMensalPct,
  parcela: null,

  aluguel: 0,
  administracao: DEFAULTS.administracaoPct,
  condominio: 0,
  iptu: 0,
  seguro: 0,
  reservaManutencao: { mode: 'value', value: 0 },
  vacancia: DEFAULTS.vacanciaPct,
  primeiroAluguelImobiliaria: true,

  bidStrategy: {
    fluxoMin: { enabled: true, min: 0 }, // fluxo ≥ R$ 0
    yieldLiquidoMin: { enabled: true, min: 7 }, // ≥ 7% a.a.
    descontoMin: { enabled: true, min: 15 }, // ≥ 15%
    icpMin: { enabled: true, min: 1.0 }, // ≥ 1,00
  },
};

// ---------------------------------------------------------------------------
// Faixas de classificação. Cada faixa tem um limite inferior inclusivo (`min`).
// As faixas são avaliadas da maior para a menor: a primeira em que
// `valor >= min` define a classificação.
// ---------------------------------------------------------------------------
export interface ScaleRange extends Classification {
  min: number;
  range: string; // texto da faixa para exibição na régua
}

// Yield bruto mensal — comparado em PONTOS PERCENTUAIS (ex.: 1.0 = 1,00%).
export const YIELD_RANGES: ScaleRange[] = [
  { min: 1.0, range: '≥ 1,00%', label: 'Excelente', emoji: '🟢', color: 'green' },
  { min: 0.8, range: '0,80% – 0,99%', label: 'Muito Bom', emoji: '🟢', color: 'green' },
  { min: 0.7, range: '0,70% – 0,79%', label: 'Bom', emoji: '🟡', color: 'yellow' },
  { min: 0.6, range: '0,60% – 0,69%', label: 'Atenção', emoji: '🟠', color: 'orange' },
  { min: -Infinity, range: '< 0,60%', label: 'Ruim', emoji: '🔴', color: 'red' },
];

// Fluxo de caixa mensal — comparado em R$.
export const CASH_FLOW_RANGES: ScaleRange[] = [
  { min: 300, range: '> R$ 300', label: 'Excelente', emoji: '🟢', color: 'green' },
  { min: 100, range: 'R$ 100 – R$ 300', label: 'Bom', emoji: '🟢', color: 'green' },
  { min: -100, range: '-R$ 100 – R$ 100', label: 'Neutro', emoji: '🟡', color: 'yellow' },
  { min: -300, range: '-R$ 300 – -R$ 100', label: 'Atenção', emoji: '🟠', color: 'orange' },
  { min: -Infinity, range: '< -R$ 300', label: 'Ruim', emoji: '🔴', color: 'red' },
];

// Desconto — comparado em PONTOS PERCENTUAIS (ex.: 20 = 20%).
export const DISCOUNT_RANGES: ScaleRange[] = [
  { min: 20, range: '> 20%', label: 'Excelente', emoji: '🟢', color: 'green' },
  { min: 15, range: '15% – 20%', label: 'Muito Bom', emoji: '🟢', color: 'green' },
  { min: 10, range: '10% – 15%', label: 'Bom', emoji: '🟡', color: 'yellow' },
  { min: 5, range: '5% – 10%', label: 'Atenção', emoji: '🟠', color: 'orange' },
  { min: -Infinity, range: '< 5%', label: 'Pequeno', emoji: '🔴', color: 'red' },
];

// Índice de Cobertura da Parcela (ICP) — razão receita líquida / parcela.
export const ICP_RANGES: ScaleRange[] = [
  { min: 1.1, range: '≥ 1,10', label: 'Excelente', emoji: '🟢', color: 'green' },
  { min: 1.0, range: '1,00 – 1,09', label: 'Bom', emoji: '🟢', color: 'green' },
  { min: 0.9, range: '0,90 – 0,99', label: 'Aceitável', emoji: '🟡', color: 'yellow' },
  { min: 0.8, range: '0,80 – 0,89', label: 'Atenção', emoji: '🟠', color: 'orange' },
  { min: -Infinity, range: '< 0,80', label: 'Ruim', emoji: '🔴', color: 'red' },
];

// Classes utilitárias Tailwind por cor (badges).
export const COLOR_CLASSES: Record<ClassColor, string> = {
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  yellow: 'bg-amber-100 text-amber-800 border-amber-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  red: 'bg-red-100 text-red-800 border-red-200',
};
