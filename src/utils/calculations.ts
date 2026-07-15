import type { DualAmount, FormState, Results } from '../types';
import { resolveParcela } from './financing';

/** Resolve um campo "% ou R$" para valor absoluto, dado a base do percentual. */
export function resolveDual(dual: DualAmount, base: number): number {
  return dual.mode === 'percent' ? (base * dual.value) / 100 : dual.value;
}

/** Valor de mercado efetivo: usa avaliação do banco quando não informado. */
export function effectiveMarketValue(form: FormState): number {
  return form.valorMercado !== null && form.valorMercado > 0
    ? form.valorMercado
    : form.avaliacaoBanco;
}

/** Executa todas as regras de negócio e devolve os resultados. */
export function computeResults(form: FormState): Results {
  const arrematacao = form.arrematacao;

  // Custos sobre a arrematação
  const comissaoValor = resolveDual(form.comissao, arrematacao);
  const assessoriaValor = resolveDual(form.assessoria, arrematacao);

  // Financiamento
  const entradaValor = resolveDual(form.entrada, arrematacao);
  const valorFinanciado = Math.max(arrematacao - entradaValor, 0);

  // Investimento total = arrematação + todos os custos de aquisição
  const investimentoTotal =
    arrematacao +
    comissaoValor +
    assessoriaValor +
    form.reforma +
    form.desocupacao +
    form.itbi +
    form.registro +
    form.outros;

  // Capital inicial = o que sai do bolso antes da renda começar
  // (entrada + custos não financiados; NÃO inclui o valor financiado).
  const capitalInicial =
    entradaValor +
    comissaoValor +
    assessoriaValor +
    form.itbi +
    form.registro +
    form.reforma +
    form.desocupacao +
    form.outros;

  // Receita
  const administracaoValor = (form.aluguel * form.administracao) / 100;
  const vacanciaValor = (form.aluguel * form.vacancia) / 100;
  const reservaManutencaoValor = resolveDual(form.reservaManutencao, form.aluguel);

  const receitaLiquida =
    form.aluguel -
    administracaoValor -
    form.condominio -
    form.iptu -
    form.seguro -
    reservaManutencaoValor -
    vacanciaValor;

  // Parcela e fluxo de caixa
  const parcela = resolveParcela({
    parcela: form.parcela,
    valorFinanciado,
    taxaJurosAnual: form.taxaJurosAnual,
    prazoMeses: form.prazoMeses,
  });
  const fluxoCaixa = receitaLiquida - parcela;

  // Yields
  const yieldBrutoMensal = investimentoTotal > 0 ? form.aluguel / investimentoTotal : 0;
  const yieldBrutoAnual = yieldBrutoMensal * 12;
  const yieldLiquidoMensal =
    investimentoTotal > 0 ? receitaLiquida / investimentoTotal : 0;
  const yieldLiquidoAnual = yieldLiquidoMensal * 12;

  // Patrimônio
  const valorMercadoEfetivo = effectiveMarketValue(form);
  const margemFinanceira = valorMercadoEfetivo - investimentoTotal;
  const descontoPct =
    valorMercadoEfetivo > 0
      ? (valorMercadoEfetivo - investimentoTotal) / valorMercadoEfetivo
      : 0;
  const alavancagem = capitalInicial > 0 ? valorMercadoEfetivo / capitalInicial : null;
  const icp = parcela > 0 ? receitaLiquida / parcela : null;

  return {
    comissaoValor,
    assessoriaValor,
    entradaValor,
    valorFinanciado,
    investimentoTotal,
    capitalInicial,
    administracaoValor,
    reservaManutencaoValor,
    vacanciaValor,
    receitaLiquida,
    parcela,
    fluxoCaixa,
    yieldBrutoMensal,
    yieldBrutoAnual,
    yieldLiquidoMensal,
    yieldLiquidoAnual,
    margemFinanceira,
    descontoPct,
    patrimonioControlado: valorMercadoEfetivo,
    valorMercadoEfetivo,
    alavancagem,
    icp,
  };
}
