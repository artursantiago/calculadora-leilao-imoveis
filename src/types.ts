// Modo de um campo que aceita percentual OU valor absoluto.
export type AmountMode = 'percent' | 'value';

export interface DualAmount {
  mode: AmountMode;
  // Se mode === 'percent': percentual (ex.: 5 representa 5%).
  // Se mode === 'value': valor absoluto em R$.
  value: number;
}

export interface FormState {
  // 1. Informações do imóvel
  arrematacao: number;
  avaliacaoBanco: number;
  valorMercado: number | null; // null → usar avaliacaoBanco
  area: number;
  cidade: string;
  bairro: string;

  // 2. Custos da aquisição (comissão/assessoria sobre a arrematação)
  comissao: DualAmount;
  assessoria: DualAmount;
  reforma: number;
  desocupacao: number;
  itbi: number;
  registro: number;
  outros: number;

  // 3. Financiamento (entrada sobre a arrematação)
  entrada: DualAmount;
  prazoMeses: number;
  taxaJurosAnual: number | null; // % ao ano
  parcela: number | null; // se informada, tem prioridade

  // 4. Receita
  aluguel: number;
  administracao: number; // %
  condominio: number;
  iptu: number;
  seguro: number;
  reservaManutencao: DualAmount; // % do aluguel OU R$
  vacancia: number; // %
}

export interface Results {
  // Custos derivados
  comissaoValor: number;
  assessoriaValor: number;
  entradaValor: number;
  valorFinanciado: number;

  investimentoTotal: number;
  capitalInicial: number;

  // Receita
  administracaoValor: number;
  reservaManutencaoValor: number;
  vacanciaValor: number;
  receitaLiquida: number;

  // Financiamento / fluxo
  parcela: number;
  fluxoCaixa: number;

  // Yields (frações; multiplicar por 100 para exibir %)
  yieldBrutoMensal: number;
  yieldBrutoAnual: number;
  yieldLiquidoMensal: number;
  yieldLiquidoAnual: number;

  // Patrimônio
  margemFinanceira: number;
  descontoPct: number; // fração
  patrimonioControlado: number;
  valorMercadoEfetivo: number;
  alavancagem: number | null; // null se capital inicial = 0
  icp: number | null; // null se parcela = 0
}

export type ClassColor = 'green' | 'yellow' | 'orange' | 'red';

export interface Classification {
  label: string;
  emoji: string;
  color: ClassColor;
}
