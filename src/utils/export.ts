import type { FormState, Results } from '../types';
import {
  classifyCashFlow,
  classifyDiscount,
  classifyICP,
  classifyYield,
} from './classification';
import {
  formatBRL,
  formatLeverage,
  formatPercentFromFraction,
  formatRatio,
} from './formatters';
import { buildExecutiveSummary } from './summary';

/** Monta um relatório em texto plano com todos os dados e métricas. */
export function buildReportText(form: FormState, r: Results): string {
  const yieldClass = classifyYield(r.yieldBrutoMensal);
  const cashClass = classifyCashFlow(r.fluxoCaixa);
  const discountClass = classifyDiscount(r.descontoPct);
  const icpClass = classifyICP(r.icp);
  const resumo = buildExecutiveSummary(r);

  const linhas = [
    '=== ANÁLISE DE INVESTIMENTO EM LEILÃO (Buy & Hold) ===',
    '',
    '— IMÓVEL —',
    `Cidade/Bairro: ${form.cidade || '-'} / ${form.bairro || '-'}`,
    `Área: ${form.area || '-'} m²`,
    `Valor de arrematação: ${formatBRL(form.arrematacao)}`,
    `Avaliação do banco: ${formatBRL(form.avaliacaoBanco)}`,
    `Valor de mercado: ${formatBRL(r.valorMercadoEfetivo)}`,
    '',
    '— CUSTOS DE AQUISIÇÃO —',
    `Comissão do leiloeiro: ${formatBRL(r.comissaoValor)}`,
    `Assessoria: ${formatBRL(r.assessoriaValor)}`,
    `Reforma: ${formatBRL(form.reforma)}`,
    `Desocupação: ${formatBRL(form.desocupacao)}`,
    `ITBI: ${formatBRL(form.itbi)}`,
    `Registro: ${formatBRL(form.registro)}`,
    `Outros: ${formatBRL(form.outros)}`,
    '',
    '— FINANCIAMENTO —',
    `Entrada: ${formatBRL(r.entradaValor)}`,
    `Valor financiado: ${formatBRL(r.valorFinanciado)}`,
    `Prazo: ${form.prazoMeses} meses`,
    `Parcela mensal: ${formatBRL(r.parcela)}`,
    '',
    '— RECEITA —',
    `Aluguel esperado: ${formatBRL(form.aluguel)}`,
    `Administração: ${formatBRL(r.administracaoValor)}`,
    `Condomínio: ${formatBRL(form.condominio)}`,
    `IPTU: ${formatBRL(form.iptu)}`,
    `Seguro: ${formatBRL(form.seguro)}`,
    `Reserva manutenção: ${formatBRL(r.reservaManutencaoValor)}`,
    `Vacância: ${formatBRL(r.vacanciaValor)}`,
    '',
    '— MÉTRICAS —',
    `Investimento total: ${formatBRL(r.investimentoTotal)}`,
    `Capital inicial necessário: ${formatBRL(r.capitalInicial)}`,
    `Receita líquida mensal: ${formatBRL(r.receitaLiquida)}`,
    `Fluxo de caixa mensal: ${formatBRL(r.fluxoCaixa)} (${cashClass.emoji} ${cashClass.label})`,
    `Yield bruto: ${formatPercentFromFraction(r.yieldBrutoMensal)} a.m. / ${formatPercentFromFraction(r.yieldBrutoAnual)} a.a. (${yieldClass.emoji} ${yieldClass.label})`,
    `Yield líquido: ${formatPercentFromFraction(r.yieldLiquidoMensal)} a.m. / ${formatPercentFromFraction(r.yieldLiquidoAnual)} a.a.`,
    `Margem financeira: ${formatBRL(r.margemFinanceira)} (${formatPercentFromFraction(r.descontoPct)})`,
    `Desconto: ${formatPercentFromFraction(r.descontoPct)} (${discountClass.emoji} ${discountClass.label})`,
    `Patrimônio controlado: ${formatBRL(r.patrimonioControlado)}`,
    `Alavancagem: ${formatLeverage(r.alavancagem)}`,
    `ICP (cobertura da parcela): ${formatRatio(r.icp)}${icpClass ? ` (${icpClass.emoji} ${icpClass.label})` : ''}`,
    '',
    '— RESUMO EXECUTIVO —',
    resumo,
  ];

  return linhas.join('\n');
}

/** Copia texto para a área de transferência. Retorna sucesso/falha. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Abre o ChatGPT numa nova aba com o texto no parâmetro de consulta.
 * Como o preenchimento automático não é garantido, o texto também é copiado
 * para a área de transferência (fallback). Retorna se a cópia deu certo.
 */
export async function openChatGPT(text: string): Promise<boolean> {
  const copied = await copyToClipboard(text);
  const url = `https://chat.openai.com/?q=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return copied;
}
