import { useMemo } from 'react';
import type { BidCriterion, FormState } from '../types';
import { computeBidStrategy } from '../utils/bidStrategy';
import { formatBRL } from '../utils/formatters';
import { Checkbox, CurrencyInput, NumberInput } from './form/inputs';
import { ClassificationBadge } from './results/ClassificationBadge';

interface Props {
  form: FormState;
  setField: (patch: Partial<FormState>) => void;
}

type CriterionKey = keyof FormState['bidStrategy'];

function Tile({
  label,
  value,
  valueClass = 'text-slate-900',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={'text-xl font-bold ' + valueClass}>{value}</span>
    </div>
  );
}

/** Barra: zona segura (verde) → limite (amarelo) → acima (vermelho), com o lance atual marcado. */
function BidBar({ maxLance, lanceAtual }: { maxLance: number; lanceAtual: number }) {
  const trackEnd = Math.max(maxLance, lanceAtual, 1) * 1.08;
  const greenW = (Math.max(maxLance, 0) * 0.95) / trackEnd;
  const yellowW = (maxLance * 0.05) / trackEnd;
  const redW = Math.max((trackEnd - maxLance) / trackEnd, 0);
  const atualPos = Math.min(Math.max(lanceAtual / trackEnd, 0), 1) * 100;

  return (
    <div className="pt-6">
      <div className="relative">
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          <div style={{ width: `${greenW * 100}%` }} className="bg-emerald-400" />
          <div style={{ width: `${yellowW * 100}%` }} className="bg-amber-400" />
          <div style={{ width: `${redW * 100}%` }} className="bg-red-400" />
        </div>
        {/* marcador do lance atual */}
        <div
          className="absolute top-[-8px] flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${atualPos}%` }}
        >
          <span className="whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Lance atual
          </span>
          <span className="h-5 w-0.5 bg-slate-800" />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>R$ 0</span>
        <span>Máx: {formatBRL(maxLance)}</span>
      </div>
    </div>
  );
}

export function BidStrategySection({ form, setField }: Props) {
  const bid = useMemo(() => computeBidStrategy(form), [form]);
  const bs = form.bidStrategy;

  function updateCriterion(key: CriterionKey, patch: Partial<BidCriterion>) {
    setField({ bidStrategy: { ...bs, [key]: { ...bs[key], ...patch } } });
  }

  const maxColor =
    bid.status === 'over'
      ? 'text-red-600'
      : bid.status === 'near'
        ? 'text-amber-600'
        : 'text-emerald-600';

  return (
    <section className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
        🎯 Estratégia de Lance
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Até quanto ainda vale a pena disputar, segundo os seus critérios. Recalcula
        automaticamente a cada alteração.
      </p>

      {/* Configuração dos critérios */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Checkbox
            label="Fluxo de caixa mínimo"
            checked={bs.fluxoMin.enabled}
            onChange={(v) => updateCriterion('fluxoMin', { enabled: v })}
          />
          <div className="w-32">
            <CurrencyInput
              value={bs.fluxoMin.min}
              onChange={(v) => updateCriterion('fluxoMin', { min: v })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Checkbox
            label="Yield líquido mínimo"
            checked={bs.yieldLiquidoMin.enabled}
            onChange={(v) => updateCriterion('yieldLiquidoMin', { enabled: v })}
          />
          <div className="w-28">
            <NumberInput
              value={bs.yieldLiquidoMin.min}
              onChange={(v) => updateCriterion('yieldLiquidoMin', { min: v })}
              suffix="% a.a."
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Checkbox
            label="Desconto mínimo"
            checked={bs.descontoMin.enabled}
            onChange={(v) => updateCriterion('descontoMin', { enabled: v })}
          />
          <div className="w-28">
            <NumberInput
              value={bs.descontoMin.min}
              onChange={(v) => updateCriterion('descontoMin', { min: v })}
              suffix="%"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Checkbox
            label="ICP mínimo"
            checked={bs.icpMin.enabled}
            onChange={(v) => updateCriterion('icpMin', { enabled: v })}
          />
          <div className="w-28">
            <NumberInput
              value={bs.icpMin.min}
              onChange={(v) => updateCriterion('icpMin', { min: v })}
            />
          </div>
        </div>
      </div>

      {/* Resultado */}
      {!bid.hasCriteria ? (
        <p className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-slate-500">
          Habilite ao menos um critério para calcular o Lance Máximo Recomendado.
        </p>
      ) : !bid.enoughData ? (
        <p className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-slate-500">
          Preencha o aluguel esperado e o valor de mercado (ou avaliação do banco) para
          calcular o Lance Máximo.
        </p>
      ) : bid.status === 'unbounded' ? (
        <p className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-slate-500">
          Os critérios atuais não limitam o lance na faixa analisada.
        </p>
      ) : bid.status === 'infeasible' ? (
        <div className="mt-5 flex flex-col gap-3">
          <ClassificationBadge classification={bid.statusBadge} />
          <p className="text-sm text-slate-600">
            Nenhum valor de lance atende a todos os critérios selecionados. Ajuste os
            critérios, revise o aluguel esperado ou reduza os custos de aquisição.
          </p>
          <div className="rounded-lg bg-white px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Mesmo no menor lance possível:
            </p>
            <ul className="flex flex-col gap-1 text-sm">
              {bid.justification.map((j) => (
                <li
                  key={j.key}
                  className={j.ok ? 'text-slate-500' : 'font-medium text-slate-800'}
                >
                  {j.ok ? '✅' : '❌'} {j.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Tile label="Lance atual" value={formatBRL(bid.lanceAtual)} />
            <Tile
              label="Lance máximo recomendado"
              value={formatBRL(bid.maxLance ?? 0)}
              valueClass={maxColor}
            />
            <Tile
              label="Margem de disputa"
              value={formatBRL(bid.margem ?? 0)}
              valueClass={(bid.margem ?? 0) < 0 ? 'text-red-600' : 'text-slate-900'}
            />
          </div>

          <div>
            <ClassificationBadge classification={bid.statusBadge} />
          </div>

          <BidBar maxLance={bid.maxLance ?? 0} lanceAtual={bid.lanceAtual} />

          <div className="rounded-lg bg-white px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              O Lance Máximo foi limitado porque, ao subir mais:
            </p>
            <ul className="flex flex-col gap-1 text-sm">
              {bid.justification.map((j) => (
                <li
                  key={j.key}
                  className={j.ok ? 'text-slate-500' : 'font-medium text-slate-800'}
                >
                  {j.ok ? '✅' : '❌'} {j.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
