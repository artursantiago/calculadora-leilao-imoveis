import type { FormState, Results } from '../types';

export interface ComparisonAssumptions {
  valorizacaoAnual: number; // % a.a. (imóvel)
  reajusteAluguelAnual: number; // % a.a.
  rendaFixaAnual: number; // % a.a.
  anos: number;
  reinvestirFluxoPositivo: boolean;
}

export interface SeriesPoint {
  mes: number;
  imovel: number; // patrimônio líquido do imóvel
  rendaFixa: number; // patrimônio acumulado na renda fixa
}

export interface ComparisonResult {
  series: SeriesPoint[];
  meses: number;

  capitalInvestido: number; // igual para as duas estratégias (mesmo desembolso)
  aportesMensaisMedios: number; // média do desembolso mensal adicional

  imovel: {
    patrimonioFinal: number;
    ganho: number;
    roi: number; // fração
    valorFinal: number; // valor de mercado estimado do imóvel
    saldoDevedor: number;
    alugueisAcumulados: number; // receita líquida acumulada
    // Patrimônio construído
    valorizacao: number;
    amortizacao: number;
    fluxoLiquidoAcumulado: number;
    ganhoAquisicao: number; // desconto capturado na compra
  };

  rendaFixa: {
    patrimonioFinal: number;
    ganho: number;
    roi: number; // fração
    jurosGanhos: number;
  };

  // Primeiro mês em que o imóvel supera a renda fixa (null se nunca supera).
  mesCruzamento: number | null;
}

/** Simula, mês a mês, a evolução patrimonial das duas estratégias. */
export function computeComparison(
  form: FormState,
  results: Results,
  a: ComparisonAssumptions,
): ComparisonResult {
  const meses = Math.max(Math.round(a.anos * 12), 1);
  const apM = Math.pow(1 + a.valorizacaoAnual / 100, 1 / 12) - 1;
  const rfM = Math.pow(1 + a.rendaFixaAnual / 100, 1 / 12) - 1;
  const reaj = a.reajusteAluguelAnual / 100;
  const taxaM = (form.taxaJurosMensal ?? 0) / 100;

  const valorMercado0 = results.valorMercadoEfetivo;
  const financiado = results.financiado;
  const capitalInicial = results.capitalInicial;

  let propValue = valorMercado0;
  let saldo = financiado ? results.valorFinanciado : 0;
  let receitaLiq = results.receitaLiquida;

  let caixaImovel = 0; // fluxos positivos retidos
  let aportesAcum = 0; // soma dos fluxos negativos (desembolso extra)
  let amortizAcum = 0; // principal amortizado (patrimônio via dívida)
  let alugueisAcum = 0; // receita líquida acumulada
  let fluxoAcum = 0; // soma de todos os fluxos (pode ser negativa)

  let rf = capitalInicial;

  const series: SeriesPoint[] = [
    { mes: 0, imovel: propValue - saldo, rendaFixa: capitalInicial },
  ];

  for (let m = 1; m <= meses; m++) {
    // Reajuste anual do aluguel (a partir do 2º ano).
    if (m > 1 && (m - 1) % 12 === 0) receitaLiq *= 1 + reaj;

    // Valorização do imóvel.
    propValue *= 1 + apM;

    // Amortização (Tabela Price) enquanto houver saldo e dentro do prazo.
    let parcela = 0;
    if (financiado && saldo > 0 && m <= form.prazoMeses) {
      const juros = saldo * taxaM;
      let principal = results.parcela - juros;
      if (principal < 0) principal = 0;
      if (principal > saldo) principal = saldo;
      saldo -= principal;
      amortizAcum += principal;
      parcela = results.parcela;
    }

    const fluxo = receitaLiq - parcela;
    alugueisAcum += receitaLiq;
    fluxoAcum += fluxo;

    // Renda fixa cresce e recebe o mesmo desembolso.
    rf *= 1 + rfM;
    if (fluxo < 0) {
      aportesAcum += -fluxo;
      rf += -fluxo; // aporte para cobrir o déficit (mesmo desembolso)
    } else {
      caixaImovel += fluxo;
      if (a.reinvestirFluxoPositivo) rf += fluxo; // renda reinvestida
    }

    series.push({ mes: m, imovel: propValue - saldo + caixaImovel, rendaFixa: rf });
  }

  const capitalInvestido = capitalInicial + aportesAcum;
  const patrimonioImovel = propValue - saldo + caixaImovel;
  const patrimonioRF = rf;

  const valorizacao = propValue - valorMercado0;
  const amortizacao = amortizAcum;
  const ganhoAquisicao = valorMercado0 - results.valorFinanciado - capitalInicial;

  // Mês de cruzamento: primeiro ponto em que a liderança troca (mudança de
  // sinal de imóvel − renda fixa em relação ao mês anterior).
  let mesCruzamento: number | null = null;
  const sign = (p: SeriesPoint) => Math.sign(p.imovel - p.rendaFixa);
  for (let i = 1; i < series.length; i++) {
    if (sign(series[i]) !== 0 && sign(series[i]) !== sign(series[i - 1])) {
      mesCruzamento = series[i].mes;
      break;
    }
  }

  return {
    series,
    meses,
    capitalInvestido,
    aportesMensaisMedios: aportesAcum / meses,
    imovel: {
      patrimonioFinal: patrimonioImovel,
      ganho: patrimonioImovel - capitalInvestido,
      roi: capitalInvestido > 0 ? (patrimonioImovel - capitalInvestido) / capitalInvestido : 0,
      valorFinal: propValue,
      saldoDevedor: saldo,
      alugueisAcumulados: alugueisAcum,
      valorizacao,
      amortizacao,
      fluxoLiquidoAcumulado: fluxoAcum,
      ganhoAquisicao,
    },
    rendaFixa: {
      patrimonioFinal: patrimonioRF,
      ganho: patrimonioRF - capitalInvestido,
      roi: capitalInvestido > 0 ? (patrimonioRF - capitalInvestido) / capitalInvestido : 0,
      jurosGanhos: patrimonioRF - capitalInvestido,
    },
    mesCruzamento,
  };
}
