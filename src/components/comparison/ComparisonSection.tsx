import { useEffect, useMemo, useState } from 'react';
import type { FormState, Results } from '../../types';
import { computeComparison } from '../../utils/comparison';
import { formatBRL, formatPercentFromFraction, formatPercentValue } from '../../utils/formatters';
import {
  FALLBACK_RATES,
  FIPEZAP_APPRECIATION,
  FIPEZAP_NATIONAL,
  FIPEZAP_SOURCE,
  fetchBenchmarkRates,
  type BenchmarkRates,
} from '../../utils/marketData';
import { Checkbox, Field, NumberInput, SegmentedControl } from '../form/inputs';
import { InfoTooltip } from '../results/InfoTooltip';
import { PatrimonioChart } from './PatrimonioChart';

type Fonte = 'cdi' | 'selic' | 'custom';

const TIP_VALORIZACAO =
  'Expectativa média de valorização do imóvel ao ano. O mercado varia por cidade, bairro e ciclo econômico. O padrão vem da variação FIPEZAP da cidade; altere conforme sua expectativa.';
const TIP_REAJUSTE =
  'Crescimento esperado do aluguel ao ano. Costuma acompanhar a inflação. O padrão usa o IPCA acumulado em 12 meses.';

function Comp({
  label,
  imovel,
  renda,
  strong,
}: {
  label: string;
  imovel: string;
  renda: string;
  strong?: boolean;
}) {
  const cls = strong ? 'font-semibold text-slate-800' : 'text-slate-600';
  return (
    <div className={'grid grid-cols-3 gap-2 px-3 py-2 text-sm ' + cls}>
      <span>{label}</span>
      <span className="text-right tabular-nums">{imovel}</span>
      <span className="text-right tabular-nums">{renda}</span>
    </div>
  );
}

function BuiltTile({ label, value }: { label: string; value: string }) {
  const positive = !value.trim().startsWith('-');
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={'text-lg font-bold ' + (positive ? 'text-emerald-600' : 'text-red-600')}>
        {positive ? '+' : ''}
        {value}
      </span>
    </div>
  );
}

export function ComparisonSection({ form, results }: { form: FormState; results: Results }) {
  const [open, setOpen] = useState(false);
  const [rates, setRates] = useState<BenchmarkRates>(FALLBACK_RATES);
  const [loaded, setLoaded] = useState(false);

  const [city, setCity] = useState('Brasil (média nacional)');
  const [fonte, setFonte] = useState<Fonte>('cdi');
  const [rendaCustom, setRendaCustom] = useState(FALLBACK_RATES.cdi);
  const [valorizacao, setValorizacao] = useState(FIPEZAP_NATIONAL);
  const [reajuste, setReajuste] = useState(FALLBACK_RATES.ipca);
  const [anos, setAnos] = useState(20);
  const [reinvestir, setReinvestir] = useState(true);
  const [descontarIR, setDescontarIR] = useState(true);
  const [irRendaFixa, setIrRendaFixa] = useState(15);

  // Busca as taxas do Banco Central na primeira vez que a seção é aberta.
  useEffect(() => {
    if (!open || loaded) return;
    let active = true;
    fetchBenchmarkRates().then((r) => {
      if (!active) return;
      setRates(r);
      setLoaded(true);
      // Atualiza defaults ainda não personalizados.
      setReajuste((cur) => (cur === FALLBACK_RATES.ipca ? r.ipca : cur));
      setRendaCustom((cur) => (cur === FALLBACK_RATES.cdi ? r.cdi : cur));
    });
    return () => {
      active = false;
    };
  }, [open, loaded]);

  const rendaFixaAnual = fonte === 'cdi' ? rates.cdi : fonte === 'selic' ? rates.selic : rendaCustom;

  const comp = useMemo(
    () =>
      computeComparison(form, results, {
        valorizacaoAnual: valorizacao,
        reajusteAluguelAnual: reajuste,
        rendaFixaAnual,
        anos,
        reinvestirFluxoPositivo: reinvestir,
        descontarIR,
        irRendaFixa,
      }),
    [form, results, valorizacao, reajuste, rendaFixaAnual, anos, reinvestir, descontarIR, irRendaFixa],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          📊 Comparação de Investimentos
        </span>
        <span className={'text-slate-400 transition-transform ' + (open ? 'rotate-90' : '')}>›</span>
      </button>

      {open && (
        <div className="flex flex-col gap-6 border-t border-slate-100 p-5">
          <p className="text-sm text-slate-500">
            Compara a evolução do patrimônio líquido do imóvel com uma aplicação de renda fixa
            usando o mesmo desembolso (capital inicial e aportes/rendas mensais).
          </p>

          {/* Premissas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Cidade (base FIPEZAP para valorização)">
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  const c = FIPEZAP_APPRECIATION.find((x) => x.city === e.target.value);
                  if (c) setValorizacao(c.value);
                }}
              >
                {FIPEZAP_APPRECIATION.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Valorização anual do imóvel"
              hint={<span className="inline-flex items-center gap-1">Padrão FIPEZAP <InfoTooltip text={TIP_VALORIZACAO} /></span>}
            >
              <NumberInput value={valorizacao} onChange={setValorizacao} suffix="% a.a." />
            </Field>

            <Field
              label="Reajuste anual do aluguel"
              hint={<span className="inline-flex items-center gap-1">Padrão IPCA 12m <InfoTooltip text={TIP_REAJUSTE} /></span>}
            >
              <NumberInput value={reajuste} onChange={setReajuste} suffix="% a.a." />
            </Field>

            <Field label="Rentabilidade da renda fixa">
              <div className="flex flex-col gap-2">
                <SegmentedControl
                  value={fonte}
                  onChange={(f) => setFonte(f)}
                  options={[
                    { value: 'cdi', label: 'CDI' },
                    { value: 'selic', label: 'Selic' },
                    { value: 'custom', label: 'Personalizada' },
                  ]}
                />
                {fonte === 'custom' ? (
                  <NumberInput value={rendaCustom} onChange={setRendaCustom} suffix="% a.a." />
                ) : (
                  <span className="text-sm text-slate-500">
                    {formatPercentValue(rendaFixaAnual)} a.a.
                  </span>
                )}
              </div>
            </Field>

            <Field label="Horizonte da análise">
              <SegmentedControl
                value={String(anos)}
                onChange={(v) => setAnos(Number(v))}
                options={[5, 10, 15, 20, 30].map((n) => ({ value: String(n), label: `${n}a` }))}
              />
            </Field>

            <div className="flex items-end">
              <Checkbox
                label="Reinvestir fluxo positivo na renda fixa"
                checked={reinvestir}
                onChange={setReinvestir}
              />
            </div>

            <div className="flex items-end">
              <Checkbox
                label="Descontar imposto de renda"
                checked={descontarIR}
                onChange={setDescontarIR}
              />
            </div>

            {descontarIR && (
              <Field
                label="IR sobre renda fixa"
                hint={
                  <span className="inline-flex items-center gap-1">
                    Aluguel usa carnê-leão automático{' '}
                    <InfoTooltip text="Renda fixa: IR sobre o rendimento no resgate (15% para prazos acima de 2 anos, tabela regressiva). Aluguel: tabela progressiva do carnê-leão (isento até ~R$ 2.259/mês, até 27,5%). A valorização do imóvel não é tributada enquanto não há venda." />
                  </span>
                }
              >
                <NumberInput value={irRendaFixa} onChange={setIrRendaFixa} suffix="%" />
              </Field>
            )}
          </div>

          {/* Comparativo final */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-3 gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Indicador</span>
              <span className="text-right">Imóvel</span>
              <span className="text-right">Renda fixa</span>
            </div>
            <Comp
              label="Capital investido"
              imovel={formatBRL(comp.capitalInvestido)}
              renda={formatBRL(comp.capitalInvestido)}
            />
            <Comp
              label="Aportes mensais (médio)"
              imovel={formatBRL(comp.aportesMensaisMedios)}
              renda={formatBRL(comp.aportesMensaisMedios)}
            />
            <Comp
              label="Patrimônio final"
              imovel={formatBRL(comp.imovel.patrimonioFinal)}
              renda={formatBRL(comp.rendaFixa.patrimonioFinal)}
              strong
            />
            <Comp
              label="Ganho líquido"
              imovel={formatBRL(comp.imovel.ganho)}
              renda={formatBRL(comp.rendaFixa.ganho)}
            />
            <Comp
              label="ROI"
              imovel={formatPercentFromFraction(comp.imovel.roi)}
              renda={formatPercentFromFraction(comp.rendaFixa.roi)}
            />
          </div>

          {/* Gráfico */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Evolução do patrimônio líquido ({anos} anos)
            </h3>
            <PatrimonioChart series={comp.series} meses={comp.meses} mesCruzamento={comp.mesCruzamento} />
            <p className="mt-2 text-xs text-slate-500">
              {comp.mesCruzamento && comp.mesCruzamento > 0
                ? `Ponto de virada: as estratégias se cruzam por volta do ${Math.round(
                    comp.mesCruzamento / 12,
                  )}º ano.`
                : comp.imovel.patrimonioFinal >= comp.rendaFixa.patrimonioFinal
                  ? 'O imóvel mantém o patrimônio à frente durante todo o período.'
                  : 'A renda fixa mantém o patrimônio à frente durante todo o período.'}
            </p>
          </div>

          {/* Patrimônio construído */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              🏗️ Patrimônio construído (imóvel)
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <BuiltTile label="Valorização do imóvel" value={formatBRL(comp.imovel.valorizacao)} />
              <BuiltTile label="Amortização do financiamento" value={formatBRL(comp.imovel.amortizacao)} />
              <BuiltTile
                label="Fluxo líquido acumulado"
                value={formatBRL(comp.imovel.fluxoLiquidoAcumulado)}
              />
              <BuiltTile label="Ganho na aquisição (desconto)" value={formatBRL(comp.imovel.ganhoAquisicao)} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              O retorno do imóvel não vem só do aluguel: soma a redução da dívida e a valorização
              do ativo — por isso a comparação é mais justa que olhar apenas o yield.
            </p>
          </div>

          {/* Impostos */}
          {descontarIR && (
            <p className="text-xs text-slate-500">
              IR estimado no período — aluguel (carnê-leão): {formatBRL(comp.impostoAluguel)} ·
              renda fixa ({formatPercentValue(irRendaFixa)} no resgate):{' '}
              {formatBRL(comp.impostoRendaFixa)}. A valorização do imóvel não é tributada
              enquanto não há venda.
            </p>
          )}

          {/* Fontes */}
          <p className="text-xs text-slate-400">
            Renda fixa:{' '}
            {rates.live
              ? `Banco Central (Selic ${formatPercentValue(rates.selic)}, CDI ${formatPercentValue(
                  rates.cdi,
                )}, IPCA ${formatPercentValue(rates.ipca)}) — ${rates.date}.`
              : `valores de referência (não foi possível atualizar automaticamente): Selic ${formatPercentValue(
                  rates.selic,
                )}, CDI ${formatPercentValue(rates.cdi)}, IPCA ${formatPercentValue(rates.ipca)}.`}{' '}
            Valorização: {FIPEZAP_SOURCE}.{' '}
            {descontarIR ? 'Comparação líquida de IR' : 'Comparação bruta (sem IR)'}; premissas
            editáveis.
          </p>
        </div>
      )}
    </section>
  );
}
