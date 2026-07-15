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
  const financiado = form.paymentMode === 'financed';

  // Custos sobre a arrematação
  const comissaoValor = resolveDual(form.comissao, arrematacao);
  const assessoriaValor = resolveDual(form.assessoria, arrematacao);
  const itbiValor = resolveDual(form.itbi, arrematacao);

  // Financiamento. À vista: nada é financiado, a arrematação inteira sai do bolso.
  const entradaValor = financiado
    ? resolveDual(form.entrada, arrematacao)
    : arrematacao;
  const valorFinanciado = financiado ? Math.max(arrematacao - entradaValor, 0) : 0;

  // Receita perdida no 1º mês (aluguel destinado à imobiliária).
  const receitaPerdidaPrimeiroMes = form.primeiroAluguelImobiliaria ? form.aluguel : 0;

  // Investimento total = arrematação + todos os custos de aquisição
  const investimentoTotal =
    arrematacao +
    comissaoValor +
    assessoriaValor +
    form.reforma +
    form.desocupacao +
    itbiValor +
    form.registro +
    form.outros;

  // Capital inicial = o que sai do bolso antes da renda começar
  // (entrada + custos não financiados + 1º aluguel; NÃO inclui o valor financiado).
  const capitalInicial =
    entradaValor +
    comissaoValor +
    assessoriaValor +
    itbiValor +
    form.registro +
    form.reforma +
    form.desocupacao +
    form.outros +
    receitaPerdidaPrimeiroMes;

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

  // Parcela e fluxo de caixa (à vista → sem parcela)
  const parcela = financiado
    ? resolveParcela({
        parcela: form.parcela,
        valorFinanciado,
        taxaJurosMensal: form.taxaJurosMensal,
        prazoMeses: form.prazoMeses,
      })
    : 0;
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

  // Preço por m²
  const precoM2Arrematacao = form.area > 0 ? arrematacao / form.area : null;
  const precoM2Mercado = form.area > 0 ? valorMercadoEfetivo / form.area : null;
  const descontoM2 =
    precoM2Mercado !== null && precoM2Mercado > 0 && precoM2Arrematacao !== null
      ? (precoM2Mercado - precoM2Arrematacao) / precoM2Mercado
      : null;

  return {
    financiado,
    comissaoValor,
    assessoriaValor,
    itbiValor,
    entradaValor,
    valorFinanciado,
    investimentoTotal,
    capitalInicial,
    receitaPerdidaPrimeiroMes,
    precoM2Arrematacao,
    precoM2Mercado,
    descontoM2,
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
