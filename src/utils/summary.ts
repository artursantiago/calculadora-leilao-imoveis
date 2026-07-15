import type { Results } from '../types';

/**
 * Gera o resumo executivo por regras condicionais (sem IA), com base nas
 * principais métricas. Segue os três cenários da especificação.
 */
export function buildExecutiveSummary(r: Results): string {
  const yieldMensalPct = r.yieldBrutoMensal * 100;
  const descontoPct = r.descontoPct * 100;
  const cobreParcela = r.icp === null || r.icp >= 1;

  // Cenário de atenção: exige aporte recorrente ou margem/yield fracos.
  if (r.fluxoCaixa < 0 || !cobreParcela) {
    return (
      'O aluguel não cobre integralmente os custos mensais, exigindo aportes ' +
      'recorrentes. A margem de compra é reduzida e o yield está abaixo do ' +
      'recomendado para investimentos Buy & Hold. Reavalie o valor de arrematação, ' +
      'os custos de aquisição e a expectativa de aluguel antes de prosseguir.'
    );
  }

  // Cenário excelente: yield alto, fluxo positivo e bom desconto.
  if (yieldMensalPct >= 1 && r.fluxoCaixa > 0 && descontoPct >= 15) {
    return (
      'O imóvel apresenta excelente potencial para estratégia Buy & Hold. O yield ' +
      'está acima de 1% ao mês, o fluxo de caixa é positivo, o aluguel cobre ' +
      'confortavelmente o financiamento e há uma boa margem de compra em relação ' +
      'ao valor de mercado.'
    );
  }

  // Cenário bom: equilíbrio e alavancagem interessante.
  return (
    'O investimento apresenta boas características para locação. O fluxo de caixa é ' +
    'próximo do equilíbrio e a alavancagem patrimonial é interessante. Vale atenção ' +
    'apenas para a margem de desconto e riscos específicos do leilão.'
  );
}
