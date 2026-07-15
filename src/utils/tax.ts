// Tabela progressiva mensal do IRPF (carnê-leão), usada para o IR sobre o
// aluguel recebido por pessoa física. Valores da tabela vigente (2024+).
interface Faixa {
  limite: number; // teto da base mensal
  aliquota: number; // fração
  deducao: number; // parcela a deduzir (R$)
}

export const CARNE_LEAO: Faixa[] = [
  { limite: 2259.2, aliquota: 0, deducao: 0 },
  { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
  { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
  { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
  { limite: Infinity, aliquota: 0.275, deducao: 896.0 },
];

/**
 * IR mensal do aluguel (carnê-leão) sobre uma base tributável (aluguel menos
 * despesas dedutíveis). Retorna 0 quando isento.
 */
export function irAluguelMensal(base: number): number {
  if (base <= 0) return 0;
  const faixa = CARNE_LEAO.find((f) => base <= f.limite) ?? CARNE_LEAO[CARNE_LEAO.length - 1];
  return Math.max(base * faixa.aliquota - faixa.deducao, 0);
}
