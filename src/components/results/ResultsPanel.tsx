import {
  CASH_FLOW_RANGES,
  DISCOUNT_RANGES,
  ICP_RANGES,
  YIELD_RANGES,
} from '../../constants';
import type { FormState, Results } from '../../types';
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
  formatPercentValue,
  formatRatio,
} from '../../utils/formatters';
import { ClassificationBadge } from './ClassificationBadge';
import { InterpretPanel } from './InterpretPanel';
import { CardDivider, ResultCard, ResultGroup, Row } from './ResultCard';

const TIPS = {
  investimentoTotal:
    'Soma da arrematação com todos os custos de aquisição (comissão, assessoria, ITBI, registro, reforma, desocupação e outros). É o custo total do imóvel.',
  capitalInicial:
    'Tudo que sai do seu bolso antes de o imóvel gerar renda: entrada e custos não financiados. Não inclui o valor financiado.',
  yieldBruto:
    'Rentabilidade mensal considerando apenas o aluguel bruto dividido pelo investimento total realizado.',
  yieldLiquido:
    'Considera o aluguel descontando administração, IPTU, condomínio, seguro, vacância e manutenção, dividido pelo investimento total.',
  fluxoCaixa:
    'A sobra (ou falta) de caixa por mês depois de pagar a parcela do financiamento com a receita líquida do aluguel.',
  icp: 'Mede quanto da parcela do financiamento é coberta pela receita líquida do aluguel. Acima de 1,10 sobra dinheiro; em 1,00 o aluguel paga exatamente a parcela; abaixo de 1,00 será necessário complementar mensalmente.',
  desconto:
    'O quanto você economiza comprando abaixo do valor de mercado: diferença entre o valor de mercado e o investimento total, sobre o valor de mercado.',
  alavancagem:
    'Quantas vezes o patrimônio controlado supera o capital que você efetivamente investiu.',
};

const LEVERS = {
  yieldBruto: ['Aluguel maior', 'Menor valor de arrematação', 'Menores custos de aquisição'],
  yieldLiquido: [
    'Aluguel maior',
    'Menor arrematação e custos de aquisição',
    'Menores custos recorrentes (IPTU, condomínio, seguro, administração, vacância, manutenção)',
  ],
  fluxoCaixa: [
    'Aluguel maior',
    'Parcela menor (mais entrada, prazo maior ou juros menor)',
    'Menores custos recorrentes',
  ],
  icp: ['Aluguel maior', 'Parcela menor', 'Menores custos recorrentes'],
  desconto: [
    'Arrematar por um valor menor',
    'Reduzir os custos de aquisição',
    'Comprar imóvel com maior valor de mercado',
  ],
  alavancagem: [
    'Menor capital inicial (mais financiamento / menor entrada)',
    'Comprar com maior desconto sobre o valor de mercado',
  ],
};

function reservaLabel(form: FormState): string {
  return form.reservaManutencao.mode === 'percent'
    ? `${formatPercentValue(form.reservaManutencao.value)} do aluguel`
    : formatBRL(form.reservaManutencao.value);
}

export function ResultsPanel({ form, results }: { form: FormState; results: Results }) {
  const r = results;
  const yieldClass = classifyYield(r.yieldBrutoMensal);
  const cashClass = classifyCashFlow(r.fluxoCaixa);
  const discountClass = classifyDiscount(r.descontoPct);
  const icpClass = classifyICP(r.icp);

  return (
    <div className="flex flex-col gap-8">
      {/* ---------------------------------------------------------------- */}
      <ResultGroup icon="💰" title="Aquisição">
        <ResultCard
          title="Investimento Total"
          value={formatBRL(r.investimentoTotal)}
          tooltip={TIPS.investimentoTotal}
        >
          <div className="flex flex-col gap-1">
            <Row label="Arrematação" value={formatBRL(form.arrematacao)} />
            <Row label="Comissão (leiloeiro)" value={formatBRL(r.comissaoValor)} />
            <Row label="Assessoria" value={formatBRL(r.assessoriaValor)} />
            <Row label="ITBI" value={formatBRL(r.itbiValor)} />
            {form.reforma > 0 && <Row label="Reforma" value={formatBRL(form.reforma)} />}
            {form.desocupacao > 0 && (
              <Row label="Desocupação" value={formatBRL(form.desocupacao)} />
            )}
            {form.registro > 0 && <Row label="Registro" value={formatBRL(form.registro)} />}
            {form.outros > 0 && <Row label="Outros" value={formatBRL(form.outros)} />}
          </div>
        </ResultCard>

        <ResultCard
          title="Capital Inicial Necessário"
          value={formatBRL(r.capitalInicial)}
          tooltip={TIPS.capitalInicial}
        >
          <div className="flex flex-col gap-1">
            <Row
              label={r.financiado ? 'Entrada' : 'Valor à vista'}
              value={formatBRL(r.entradaValor)}
            />
            <Row label="Comissão (leiloeiro)" value={formatBRL(r.comissaoValor)} />
            <Row label="Assessoria" value={formatBRL(r.assessoriaValor)} />
            <Row label="ITBI" value={formatBRL(r.itbiValor)} />
            {form.registro > 0 && <Row label="Registro" value={formatBRL(form.registro)} />}
            {form.reforma > 0 && <Row label="Reforma" value={formatBRL(form.reforma)} />}
            {form.desocupacao > 0 && (
              <Row label="Desocupação" value={formatBRL(form.desocupacao)} />
            )}
            {form.outros > 0 && <Row label="Outros" value={formatBRL(form.outros)} />}
            {r.receitaPerdidaPrimeiroMes > 0 && (
              <Row
                label="1º aluguel (imobiliária)"
                value={formatBRL(r.receitaPerdidaPrimeiroMes)}
              />
            )}
          </div>
        </ResultCard>

        <ResultCard title="Condições de Pagamento" value={r.financiado ? 'Financiado' : 'À vista'}>
          {r.financiado ? (
            <div className="flex flex-col gap-1">
              <Row label="Entrada" value={formatBRL(r.entradaValor)} />
              <Row label="Financiado" value={formatBRL(r.valorFinanciado)} />
              <Row label="Prazo" value={`${form.prazoMeses} meses`} />
              <Row
                label="Taxa"
                value={
                  form.taxaJurosMensal !== null
                    ? `${formatPercentValue(form.taxaJurosMensal)} a.m.`
                    : '—'
                }
              />
              <CardDivider />
              <Row label="Parcela" value={formatBRL(r.parcela)} strong />
            </div>
          ) : (
            <span className="text-sm text-slate-500">
              Compra à vista — sem entrada, parcela ou juros.
            </span>
          )}
        </ResultCard>
      </ResultGroup>

      {/* ---------------------------------------------------------------- */}
      <ResultGroup icon="📈" title="Rentabilidade">
        <ResultCard title="Receita Líquida Mensal" value={formatBRL(r.receitaLiquida)}>
          <div className="flex flex-col gap-1">
            <Row label="Aluguel" value={formatBRL(form.aluguel)} />
            <Row label="Administração" value={`- ${formatBRL(r.administracaoValor)}`} />
            {form.condominio > 0 && (
              <Row label="Condomínio" value={`- ${formatBRL(form.condominio)}`} />
            )}
            {form.iptu > 0 && <Row label="IPTU" value={`- ${formatBRL(form.iptu)}`} />}
            {form.seguro > 0 && <Row label="Seguro" value={`- ${formatBRL(form.seguro)}`} />}
            {r.reservaManutencaoValor > 0 && (
              <Row label="Manutenção" value={`- ${formatBRL(r.reservaManutencaoValor)}`} />
            )}
            <Row label="Vacância" value={`- ${formatBRL(r.vacanciaValor)}`} />
          </div>
        </ResultCard>

        <ResultCard
          title="Fluxo de Caixa Mensal"
          value={formatBRL(r.fluxoCaixa)}
          valueClass={r.fluxoCaixa < 0 ? 'text-red-600' : 'text-emerald-600'}
        >
          <div className="flex flex-col gap-1">
            <Row label="Receita líquida" value={formatBRL(r.receitaLiquida)} />
            <Row label="Parcela" value={`- ${formatBRL(r.parcela)}`} />
            <CardDivider />
            <Row label="Resultado" value={formatBRL(r.fluxoCaixa)} strong />
          </div>
          <div className="mt-1">
            <ClassificationBadge classification={cashClass} />
          </div>
          <InterpretPanel
            concept={TIPS.fluxoCaixa}
            formula={{
              a: { label: 'Receita líquida', value: formatBRL(r.receitaLiquida) },
              op: '−',
              b: { label: 'Parcela', value: formatBRL(r.parcela) },
              result: { label: 'Fluxo', value: formatBRL(r.fluxoCaixa) },
            }}
            scale={{ rows: CASH_FLOW_RANGES, activeLabel: cashClass.label }}
            levers={LEVERS.fluxoCaixa}
          />
        </ResultCard>

        <ResultCard title="Yield Bruto">
          <div className="flex flex-col gap-1">
            <Row label="Mensal" value={formatPercentFromFraction(r.yieldBrutoMensal)} strong />
            <Row label="Anual" value={formatPercentFromFraction(r.yieldBrutoAnual)} />
          </div>
          <div className="mt-1">
            <ClassificationBadge classification={yieldClass} />
          </div>
          <InterpretPanel
            concept={TIPS.yieldBruto}
            formula={{
              a: { label: 'Aluguel', value: formatBRL(form.aluguel) },
              op: '÷',
              b: { label: 'Investimento total', value: formatBRL(r.investimentoTotal) },
              result: { label: 'Yield mensal', value: formatPercentFromFraction(r.yieldBrutoMensal) },
            }}
            scale={{ rows: YIELD_RANGES, activeLabel: yieldClass.label }}
            levers={LEVERS.yieldBruto}
          />
        </ResultCard>

        <ResultCard title="Yield Líquido">
          <div className="flex flex-col gap-1">
            <Row
              label="Mensal"
              value={formatPercentFromFraction(r.yieldLiquidoMensal)}
              strong
            />
            <Row label="Anual" value={formatPercentFromFraction(r.yieldLiquidoAnual)} />
          </div>
          <InterpretPanel
            concept={TIPS.yieldLiquido}
            formula={{
              a: { label: 'Receita líquida', value: formatBRL(r.receitaLiquida) },
              op: '÷',
              b: { label: 'Investimento total', value: formatBRL(r.investimentoTotal) },
              result: {
                label: 'Yield mensal',
                value: formatPercentFromFraction(r.yieldLiquidoMensal),
              },
            }}
            levers={LEVERS.yieldLiquido}
          />
        </ResultCard>

        <ResultCard title="Índice de Cobertura da Parcela" value={formatRatio(r.icp)}>
          {icpClass ? (
            <>
              <ClassificationBadge classification={icpClass} />
              <InterpretPanel
                concept={TIPS.icp}
                formula={{
                  a: { label: 'Receita líquida', value: formatBRL(r.receitaLiquida) },
                  op: '÷',
                  b: { label: 'Parcela', value: formatBRL(r.parcela) },
                  result: { label: 'ICP', value: formatRatio(r.icp) },
                }}
                scale={{ rows: ICP_RANGES, activeLabel: icpClass.label }}
                levers={LEVERS.icp}
              />
            </>
          ) : (
            <span className="text-sm text-slate-400">
              {r.financiado ? 'Sem parcela informada' : 'Compra à vista (sem financiamento)'}
            </span>
          )}
        </ResultCard>
      </ResultGroup>

      {/* ---------------------------------------------------------------- */}
      <ResultGroup icon="🏠" title="Patrimônio">
        <ResultCard title="Alavancagem" value={formatLeverage(r.alavancagem)}>
          <div className="flex flex-col gap-1">
            <Row label="Capital investido" value={formatBRL(r.capitalInicial)} />
            <Row label="Patrimônio controlado" value={formatBRL(r.patrimonioControlado)} />
          </div>
          {r.alavancagem !== null && (
            <>
              <span className="mt-1 text-xs text-slate-400">
                Você controla um patrimônio {formatLeverage(r.alavancagem)} maior que o capital
                investido.
              </span>
              <InterpretPanel
                concept={TIPS.alavancagem}
                formula={{
                  a: { label: 'Patrimônio controlado', value: formatBRL(r.patrimonioControlado) },
                  op: '÷',
                  b: { label: 'Capital investido', value: formatBRL(r.capitalInicial) },
                  result: { label: 'Alavancagem', value: formatLeverage(r.alavancagem) },
                }}
                levers={LEVERS.alavancagem}
              />
            </>
          )}
        </ResultCard>

        <ResultCard
          title="Desconto Obtido"
          value={formatPercentFromFraction(r.descontoPct)}
          valueClass={r.margemFinanceira >= 0 ? 'text-emerald-600' : 'text-red-600'}
        >
          <div className="flex flex-col gap-1">
            <Row label="Valor de mercado" value={formatBRL(r.valorMercadoEfetivo)} />
            <Row label="Investimento total" value={formatBRL(r.investimentoTotal)} />
            <CardDivider />
            <Row label="Economia" value={formatBRL(r.margemFinanceira)} strong />
          </div>
          <div className="mt-1">
            <ClassificationBadge classification={discountClass} />
          </div>
          <InterpretPanel
            concept={TIPS.desconto}
            formula={{
              a: { label: 'Economia', value: formatBRL(r.margemFinanceira) },
              op: '÷',
              b: { label: 'Valor de mercado', value: formatBRL(r.valorMercadoEfetivo) },
              result: { label: 'Desconto', value: formatPercentFromFraction(r.descontoPct) },
            }}
            scale={{ rows: DISCOUNT_RANGES, activeLabel: discountClass.label }}
            levers={LEVERS.desconto}
          />
        </ResultCard>

        <ResultCard title="Condições do Imóvel">
          <div className="flex flex-col gap-1">
            <Row label="Arrematação" value={formatBRL(form.arrematacao)} />
            <Row label="Mercado" value={formatBRL(r.valorMercadoEfetivo)} />
            <Row label="Área" value={form.area > 0 ? `${form.area} m²` : '—'} />
            <Row
              label="Arrematação/m²"
              value={r.precoM2Arrematacao !== null ? formatBRL(r.precoM2Arrematacao) : '—'}
            />
            <Row
              label="Mercado/m²"
              value={r.precoM2Mercado !== null ? formatBRL(r.precoM2Mercado) : '—'}
            />
            {r.descontoM2 !== null && (
              <Row
                label="Desconto no m²"
                value={formatPercentFromFraction(r.descontoM2)}
                strong
              />
            )}
          </div>
        </ResultCard>
      </ResultGroup>

      {/* ---------------------------------------------------------------- */}
      <ResultGroup icon="📋" title="Observações">
        <ResultCard title="Premissas e observações" wide>
          <div className="flex flex-col gap-1">
            <Row
              label="1º aluguel para a imobiliária"
              value={form.primeiroAluguelImobiliaria ? 'Sim' : 'Não'}
            />
            <Row label="Vacância" value={formatPercentValue(form.vacancia)} muted />
            <Row label="Administração" value={formatPercentValue(form.administracao)} muted />
            <Row label="Reserva de manutenção" value={reservaLabel(form)} muted />
            <Row label="Comissão do leiloeiro" value={formatBRL(r.comissaoValor)} muted />
            <Row label="Assessoria" value={formatBRL(r.assessoriaValor)} muted />
          </div>
        </ResultCard>
      </ResultGroup>
    </div>
  );
}
