import type { Results } from '../../types';
import {
  classifyCashFlow,
  classifyDiscount,
  classifyICP,
  classifyYield,
} from '../../utils/classification';
import {
  formatBRL,
  formatLeverage,
  formatPercentFromFraction,
  formatRatio,
} from '../../utils/formatters';
import { ClassificationBadge } from './ClassificationBadge';
import { ExecutiveSummary } from './ExecutiveSummary';
import { ResultCard } from './ResultCard';

export function ResultsPanel({ results }: { results: Results }) {
  const r = results;
  const yieldClass = classifyYield(r.yieldBrutoMensal);
  const cashClass = classifyCashFlow(r.fluxoCaixa);
  const discountClass = classifyDiscount(r.descontoPct);
  const icpClass = classifyICP(r.icp);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResultCard title="Investimento Total" value={formatBRL(r.investimentoTotal)} />
        <ResultCard title="Capital Inicial Necessário" value={formatBRL(r.capitalInicial)} />
        <ResultCard title="Receita Líquida Mensal" value={formatBRL(r.receitaLiquida)} />

        <ResultCard title="Fluxo de Caixa Mensal" value={formatBRL(r.fluxoCaixa)}>
          <ClassificationBadge classification={cashClass} />
        </ResultCard>

        <ResultCard title="Yield Bruto" value={formatPercentFromFraction(r.yieldBrutoMensal)}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">
              {formatPercentFromFraction(r.yieldBrutoAnual)} ao ano
            </span>
            <ClassificationBadge classification={yieldClass} />
          </div>
        </ResultCard>

        <ResultCard
          title="Yield Líquido"
          value={formatPercentFromFraction(r.yieldLiquidoMensal)}
        >
          <span className="text-sm text-slate-500">
            {formatPercentFromFraction(r.yieldLiquidoAnual)} ao ano
          </span>
        </ResultCard>

        <ResultCard title="Margem Financeira" value={formatBRL(r.margemFinanceira)}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">
              {formatPercentFromFraction(r.descontoPct)} de desconto
            </span>
            <ClassificationBadge classification={discountClass} />
          </div>
        </ResultCard>

        <ResultCard title="Índice de Cobertura da Parcela" value={formatRatio(r.icp)}>
          {icpClass ? (
            <ClassificationBadge classification={icpClass} />
          ) : (
            <span className="text-sm text-slate-400">Sem parcela informada</span>
          )}
        </ResultCard>

        <ResultCard title="Alavancagem" value={formatLeverage(r.alavancagem)}>
          <span className="text-sm text-slate-500">
            {r.alavancagem !== null
              ? `Com o capital inicial investido você controla um patrimônio equivalente a ${formatLeverage(
                  r.alavancagem,
                )} esse valor.`
              : 'Informe o capital inicial para calcular a alavancagem.'}
          </span>
        </ResultCard>
      </div>

      <ExecutiveSummary results={r} />
    </div>
  );
}
