// Modo de um campo que aceita percentual OU valor absoluto.
export type AmountMode = 'percent' | 'value';

export interface DualAmount {
  mode: AmountMode;
  // Se mode === 'percent': percentual (ex.: 5 representa 5%).
  // Se mode === 'value': valor absoluto em R$.
  value: number;
}

export type PaymentMode = 'cash' | 'financed';

/** Um critério da estratégia de lance: habilitado + valor mínimo aceitável. */
export interface BidCriterion {
  enabled: boolean;
  min: number;
}

export interface BidStrategy {
  fluxoMin: BidCriterion; // R$
  yieldLiquidoMin: BidCriterion; // % ao ano
  descontoMin: BidCriterion; // %
  icpMin: BidCriterion; // razão
}

export interface FormState {
  // 1. Informações do imóvel
  arrematacao: number;
  avaliacaoBanco: number;
  valorMercado: number | null; // null → usar avaliacaoBanco
  area: number;

  // 2. Custos da aquisição (comissão/assessoria/ITBI sobre a arrematação)
  comissao: DualAmount;
  assessoria: DualAmount;
  reforma: number;
  desocupacao: number;
  itbi: DualAmount; // % da arrematação (padrão) OU R$
  registro: number;
  outros: number;

  // 3. Financiamento
  paymentMode: PaymentMode; // à vista ou financiado
  entrada: DualAmount; // sobre a arrematação
  prazoMeses: number;
  taxaJurosMensal: number | null; // % ao mês
  parcela: number | null; // se informada, tem prioridade

  // 4. Receita
  aluguel: number;
  administracao: number; // %
  condominio: number;
  iptu: number;
  seguro: number;
  reservaManutencao: DualAmount; // % do aluguel OU R$
  vacancia: number; // %
  primeiroAluguelImobiliaria: boolean; // 1º aluguel fica com a imobiliária

  // 5. Estratégia de lance (critérios do investidor)
  bidStrategy: BidStrategy;
}

export interface Results {
  financiado: boolean;

  // Custos derivados
  comissaoValor: number;
  assessoriaValor: number;
  itbiValor: number;
  entradaValor: number;
  valorFinanciado: number;

  investimentoTotal: number;
  capitalInicial: number;
  receitaPerdidaPrimeiroMes: number; // 1º aluguel destinado à imobiliária

  // Preço por m² (null quando a área não é informada)
  precoM2Arrematacao: number | null;
  precoM2Mercado: number | null;
  descontoM2: number | null; // fração

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
