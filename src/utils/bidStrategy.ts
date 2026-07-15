import type { Classification, FormState } from '../types';
import { computeResults, effectiveMarketValue } from './calculations';
import { formatBRL, formatPercentValue, formatRatio } from './formatters';

export type BidStatus = 'safe' | 'near' | 'over' | 'none' | 'unbounded' | 'infeasible';

export interface CriterionStatus {
  key: string;
  enabled: boolean;
  ok: boolean; // atende no ponto avaliado
  detail: string; // texto para a justificativa
}

export interface BidStrategyResult {
  enoughData: boolean;
  hasCriteria: boolean;
  lanceAtual: number;
  maxLance: number | null; // null quando não há critérios ou não há limite
  margem: number | null; // maxLance - lanceAtual
  status: BidStatus;
  statusBadge: Classification;
  justification: CriterionStatus[]; // status de cada critério logo acima do lance máximo
}

const CRITERIA = [
  { key: 'fluxo', label: 'Fluxo de caixa' },
  { key: 'yield', label: 'Yield líquido' },
  { key: 'desconto', label: 'Desconto' },
  { key: 'icp', label: 'ICP' },
] as const;

/** Avalia cada critério para um dado lance; retorna se está habilitado e se atende. */
function checkCriteria(form: FormState, lance: number): Record<string, boolean> {
  const r = computeResults({ ...form, arrematacao: lance });
  const bs = form.bidStrategy;
  return {
    fluxo: r.fluxoCaixa >= bs.fluxoMin.min,
    yield: r.yieldLiquidoAnual * 100 >= bs.yieldLiquidoMin.min,
    desconto: r.descontoPct * 100 >= bs.descontoMin.min,
    // ICP sem parcela (à vista) não limita o lance.
    icp: r.icp === null ? true : r.icp >= bs.icpMin.min,
  };
}

function enabledMap(form: FormState): Record<string, boolean> {
  const bs = form.bidStrategy;
  return {
    fluxo: bs.fluxoMin.enabled,
    yield: bs.yieldLiquidoMin.enabled,
    desconto: bs.descontoMin.enabled,
    icp: bs.icpMin.enabled,
  };
}

function passesAll(form: FormState, lance: number, enabled: Record<string, boolean>): boolean {
  const checks = checkCriteria(form, lance);
  return CRITERIA.every((c) => !enabled[c.key] || checks[c.key]);
}

// Lance mínimo usado para avaliar a viabilidade. Não pode ser 0: em lance 0 o
// investimento total é 0 e o yield/ICP ficam degenerados (guardas de divisão
// por zero), o que falsamente reprovaria os critérios.
const LOW = 1;

/**
 * Como todos os critérios pioram monotonicamente conforme o lance sobe,
 * o maior lance que atende a todos é encontrado por busca binária.
 * - feasible=false → nem o menor lance atende aos critérios.
 * - unbounded=true → os critérios não limitam o lance na faixa analisada.
 */
function findMaxLance(
  form: FormState,
  enabled: Record<string, boolean>,
): { maxLance: number; unbounded: boolean; feasible: boolean } {
  if (!passesAll(form, LOW, enabled)) {
    return { maxLance: 0, unbounded: false, feasible: false };
  }

  const base = Math.max(effectiveMarketValue(form), form.arrematacao, 1);
  const hi = base * 5 + 1_000_000;
  if (passesAll(form, hi, enabled)) return { maxLance: hi, unbounded: true, feasible: true };

  let lo = LOW;
  let high = hi;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + high) / 2;
    if (passesAll(form, mid, enabled)) lo = mid;
    else high = mid;
  }
  return { maxLance: Math.floor(lo), unbounded: false, feasible: true };
}

function detailFor(
  form: FormState,
  key: string,
  ok: boolean,
): string {
  const bs = form.bidStrategy;
  switch (key) {
    case 'fluxo':
      return ok
        ? `Fluxo de caixa permanece ≥ ${formatBRL(bs.fluxoMin.min)}`
        : `O fluxo de caixa ficaria abaixo de ${formatBRL(bs.fluxoMin.min)}`;
    case 'yield':
      return ok
        ? `Yield líquido continua ≥ ${formatPercentValue(bs.yieldLiquidoMin.min)} a.a.`
        : `O yield líquido cairia abaixo de ${formatPercentValue(bs.yieldLiquidoMin.min)} a.a.`;
    case 'desconto':
      return ok
        ? `Desconto continua ≥ ${formatPercentValue(bs.descontoMin.min)}`
        : `O desconto cairia abaixo de ${formatPercentValue(bs.descontoMin.min)}`;
    case 'icp':
      return ok
        ? `ICP continua ≥ ${formatRatio(bs.icpMin.min)}`
        : `O ICP cairia abaixo de ${formatRatio(bs.icpMin.min)}`;
    default:
      return '';
  }
}

const STATUS_BADGE: Record<BidStatus, Classification> = {
  safe: { label: 'Ainda vale continuar disputando', emoji: '🟢', color: 'green' },
  near: { label: 'Próximo do limite', emoji: '🟡', color: 'yellow' },
  over: { label: 'Limite ultrapassado', emoji: '🔴', color: 'red' },
  unbounded: { label: 'Critérios não limitam o lance', emoji: '🟢', color: 'green' },
  infeasible: { label: 'Nenhum lance atende aos critérios', emoji: '🔴', color: 'red' },
  none: { label: 'Nenhum critério habilitado', emoji: '⚪', color: 'orange' },
};

/** Calcula toda a estratégia de lance a partir do formulário. */
export function computeBidStrategy(form: FormState): BidStrategyResult {
  const enabled = enabledMap(form);
  const hasCriteria = CRITERIA.some((c) => enabled[c.key]);
  const enoughData = form.aluguel > 0 && effectiveMarketValue(form) > 0;
  const lanceAtual = form.arrematacao;

  if (!hasCriteria || !enoughData) {
    return {
      enoughData,
      hasCriteria,
      lanceAtual,
      maxLance: null,
      margem: null,
      status: 'none',
      statusBadge: STATUS_BADGE.none,
      justification: [],
    };
  }

  const { maxLance, unbounded, feasible } = findMaxLance(form, enabled);

  // Justificativa: se inviável, mostra quais critérios falham já no menor lance;
  // caso contrário, avalia logo ACIMA do máximo para saber qual seria violado.
  const probe = !feasible ? LOW : maxLance + Math.max(maxLance * 0.005, 100);
  const checksAtProbe = checkCriteria(form, probe);
  const justification: CriterionStatus[] = CRITERIA.filter((c) => enabled[c.key]).map((c) => ({
    key: c.key,
    enabled: true,
    ok: checksAtProbe[c.key],
    detail: detailFor(form, c.key, checksAtProbe[c.key]),
  }));

  let status: BidStatus;
  if (!feasible) status = 'infeasible';
  else if (unbounded) status = 'unbounded';
  else if (lanceAtual > maxLance) status = 'over';
  else if (maxLance > 0 && lanceAtual >= maxLance * 0.95) status = 'near';
  else status = 'safe';

  return {
    enoughData,
    hasCriteria,
    lanceAtual,
    maxLance: unbounded ? null : maxLance,
    margem: feasible && !unbounded ? maxLance - lanceAtual : null,
    status,
    statusBadge: STATUS_BADGE[status],
    justification,
  };
}
