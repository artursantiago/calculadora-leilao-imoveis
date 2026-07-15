import {
  CASH_FLOW_RANGES,
  DISCOUNT_RANGES,
  ICP_RANGES,
  YIELD_RANGES,
  type ScaleRange,
} from '../constants';
import type { Classification } from '../types';

/** Seleciona a primeira faixa (da maior para a menor) em que valor >= min. */
function classify(ranges: ScaleRange[], value: number): Classification {
  const match = ranges.find((r) => value >= r.min) ?? ranges[ranges.length - 1];
  const { min: _min, range: _range, ...classification } = match;
  return classification;
}

/** Yield bruto — recebe a fração mensal (ex.: 0.01) e classifica em % a.m. */
export function classifyYield(yieldBrutoMensalFraction: number): Classification {
  return classify(YIELD_RANGES, yieldBrutoMensalFraction * 100);
}

/** Fluxo de caixa mensal — recebe o valor em R$. */
export function classifyCashFlow(fluxoCaixa: number): Classification {
  return classify(CASH_FLOW_RANGES, fluxoCaixa);
}

/** Desconto — recebe a fração (ex.: 0.2) e classifica em %. */
export function classifyDiscount(descontoFraction: number): Classification {
  return classify(DISCOUNT_RANGES, descontoFraction * 100);
}

/** ICP — recebe a razão (receita líquida / parcela); null quando não aplicável. */
export function classifyICP(icp: number | null): Classification | null {
  if (icp === null) return null;
  return classify(ICP_RANGES, icp);
}
