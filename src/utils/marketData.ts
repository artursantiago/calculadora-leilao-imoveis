// Dados de mercado usados como benchmark e premissas fundamentadas.

export interface BenchmarkRates {
  selic: number; // % a.a.
  cdi: number; // % a.a.
  ipca: number; // % (acumulado 12 meses)
  live: boolean; // true se veio da API do Banco Central
  date: string | null; // data de referência do dado
}

// Referência (último dado conhecido do Banco Central), usada se a API falhar.
export const FALLBACK_RATES: BenchmarkRates = {
  selic: 14.25,
  cdi: 14.15,
  ipca: 4.64,
  live: false,
  date: '08/2026',
};

const SGS = (serie: number) =>
  `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`;

/**
 * Busca Selic (série 432) e IPCA 12m (série 13522) na API pública do Banco
 * Central. CDI é estimado como Selic − 0,10 (spread histórico). Em caso de
 * falha (rede/CORS), retorna os valores de referência.
 */
export async function fetchBenchmarkRates(): Promise<BenchmarkRates> {
  try {
    const getValue = async (serie: number) => {
      const res = await fetch(SGS(serie));
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { data: string; valor: string }[];
      return json[0];
    };
    const [selicRow, ipcaRow] = await Promise.all([getValue(432), getValue(13522)]);
    const selic = Number.parseFloat(selicRow.valor);
    const ipca = Number.parseFloat(ipcaRow.valor);
    if (!Number.isFinite(selic) || !Number.isFinite(ipca)) return FALLBACK_RATES;
    return { selic, cdi: Math.max(selic - 0.1, 0), ipca, live: true, date: selicRow.data };
  } catch {
    return FALLBACK_RATES;
  }
}

// ---------------------------------------------------------------------------
// FIPEZAP — valorização (variação de venda nos últimos 12 meses, informe
// dez/2025). Não há API REST pública; os dados são publicados em relatório.
// Servem como default fundamentado (editável), com fallback para a média
// nacional quando a cidade não está na base.
// ---------------------------------------------------------------------------
export const FIPEZAP_NATIONAL = 6.52;

export const FIPEZAP_SOURCE =
  'FIPEZAP — variação de venda nos últimos 12 meses (informe dez/2025)';

export interface CityAppreciation {
  city: string;
  value: number;
}

export const FIPEZAP_APPRECIATION: CityAppreciation[] = [
  { city: 'Brasil (média nacional)', value: FIPEZAP_NATIONAL },
  { city: 'Belém', value: 10.73 },
  { city: 'Belo Horizonte', value: 13.7 },
  { city: 'Campo Grande', value: 8.76 },
  { city: 'Cuiabá', value: 7.54 },
  { city: 'Curitiba', value: 11.15 },
  { city: 'Florianópolis', value: 8.22 },
  { city: 'Fortaleza', value: 13.47 },
  { city: 'João Pessoa', value: 14.45 },
  { city: 'Maceió', value: 9.46 },
  { city: 'Salvador', value: 15.96 },
  { city: 'São Luís', value: 11.48 },
  { city: 'Teresina', value: 8.75 },
  { city: 'Vitória', value: 20.82 },
];
