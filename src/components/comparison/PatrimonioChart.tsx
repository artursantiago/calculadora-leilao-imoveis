import { useRef, useState } from 'react';
import type { SeriesPoint } from '../../utils/comparison';

const IMOVEL = '#4f46e5'; // indigo
const RENDA = '#f59e0b'; // amber

const W = 720;
const H = 300;
const PAD = { l: 74, r: 76, t: 16, b: 30 };
const innerW = W - PAD.l - PAD.r;
const innerH = H - PAD.t - PAD.b;

function compactBRL(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  if (abs >= 1_000) return `R$ ${Math.round(v / 1000)} mil`;
  return `R$ ${Math.round(v)}`;
}

const fullBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function PatrimonioChart({
  series,
  meses,
  mesCruzamento,
}: {
  series: SeriesPoint[];
  meses: number;
  mesCruzamento: number | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const maxY = Math.max(...series.map((p) => Math.max(p.imovel, p.rendaFixa)), 1);
  const minY = Math.min(0, ...series.map((p) => Math.min(p.imovel, p.rendaFixa)));

  const x = (mes: number) => PAD.l + (mes / meses) * innerW;
  const y = (v: number) => PAD.t + innerH - ((v - minY) / (maxY - minY)) * innerH;

  const path = (key: 'imovel' | 'rendaFixa') =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.mes).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ');

  // Grades horizontais (5 níveis).
  const ticks = Array.from({ length: 5 }, (_, i) => minY + ((maxY - minY) * i) / 4);
  // Rótulos de anos no eixo x.
  const anos = Math.round(meses / 12);
  const stepAno = anos > 15 ? 5 : anos > 8 ? 2 : 1;
  const xLabels: number[] = [];
  for (let a = 0; a <= anos; a += stepAno) xLabels.push(a * 12);

  const last = series[series.length - 1];
  const hoverPoint = hover !== null ? series[hover] : null;

  function onMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const ratio = Math.min(Math.max((px - PAD.l) / innerW, 0), 1);
    setHover(Math.round(ratio * meses));
  }

  return (
    <div className="relative" ref={ref} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      {/* Legenda */}
      <div className="mb-2 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: IMOVEL }} /> Imóvel
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: RENDA }} /> Renda fixa
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* grades + rótulos y */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#94a3b8">
              {compactBRL(t)}
            </text>
          </g>
        ))}
        {/* rótulos x (anos) */}
        {xLabels.map((mes) => (
          <text key={mes} x={x(mes)} y={H - 8} textAnchor="middle" fontSize={11} fill="#94a3b8">
            {mes === 0 ? '0' : `${mes / 12}a`}
          </text>
        ))}

        {/* cruzamento */}
        {mesCruzamento !== null && mesCruzamento > 0 && (
          <line
            x1={x(mesCruzamento)}
            x2={x(mesCruzamento)}
            y1={PAD.t}
            y2={PAD.t + innerH}
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}

        {/* linhas */}
        <path d={path('rendaFixa')} fill="none" stroke={RENDA} strokeWidth={2} strokeLinejoin="round" />
        <path d={path('imovel')} fill="none" stroke={IMOVEL} strokeWidth={2} strokeLinejoin="round" />

        {/* rótulos diretos nos fins de linha (marca colorida + texto em tinta) */}
        <circle cx={x(last.mes)} cy={y(last.imovel)} r={3.5} fill={IMOVEL} />
        <text x={x(last.mes) + 7} y={y(last.imovel) + 4} fontSize={11} fill="#475569">Imóvel</text>
        <circle cx={x(last.mes)} cy={y(last.rendaFixa)} r={3.5} fill={RENDA} />
        <text x={x(last.mes) + 7} y={y(last.rendaFixa) + 4} fontSize={11} fill="#475569">Renda fixa</text>

        {/* hover */}
        {hoverPoint && (
          <g>
            <line
              x1={x(hoverPoint.mes)}
              x2={x(hoverPoint.mes)}
              y1={PAD.t}
              y2={PAD.t + innerH}
              stroke="#cbd5e1"
              strokeWidth={1}
            />
            <circle cx={x(hoverPoint.mes)} cy={y(hoverPoint.imovel)} r={4} fill={IMOVEL} stroke="#fff" strokeWidth={1.5} />
            <circle cx={x(hoverPoint.mes)} cy={y(hoverPoint.rendaFixa)} r={4} fill={RENDA} stroke="#fff" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {/* tooltip */}
      {hoverPoint && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: `${Math.min((x(hoverPoint.mes) / W) * 100, 72)}%`,
          }}
        >
          <div className="font-semibold text-slate-700">
            Ano {(hoverPoint.mes / 12).toFixed(hoverPoint.mes % 12 === 0 ? 0 : 1)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-sm" style={{ background: IMOVEL }} /> {fullBRL(hoverPoint.imovel)}
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-sm" style={{ background: RENDA }} /> {fullBRL(hoverPoint.rendaFixa)}
          </div>
        </div>
      )}
    </div>
  );
}
