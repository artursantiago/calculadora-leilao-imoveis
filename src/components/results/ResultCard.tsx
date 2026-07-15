import type { ReactNode } from 'react';
import { InfoTooltip } from './InfoTooltip';

interface ResultCardProps {
  title: string;
  value?: string;
  valueClass?: string;
  tooltip?: string;
  /** Card ocupa duas colunas em telas maiores. */
  wide?: boolean;
  children?: ReactNode;
}

export function ResultCard({
  title,
  value,
  valueClass = 'text-slate-900',
  tooltip,
  wide,
  children,
}: ResultCardProps) {
  return (
    <div
      className={
        'flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ' +
        (wide ? 'sm:col-span-2' : '')
      }
    >
      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
        {title}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      {value !== undefined && (
        <span className={'text-2xl font-bold ' + valueClass}>{value}</span>
      )}
      {children}
    </div>
  );
}

/** Linha rótulo → valor usada na composição/breakdown dos cards. */
export function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={
        'flex items-baseline justify-between gap-2 text-sm ' +
        (strong ? 'font-semibold text-slate-800' : 'text-slate-600') +
        (muted ? ' text-slate-400' : '')
      }
    >
      <span>{label}</span>
      <span className={strong ? '' : 'tabular-nums'}>{value}</span>
    </div>
  );
}

/** Bloco de resultados com título e grade de cards. */
export function ResultGroup({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-700">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

/** Divisória fina dentro de um card, antes de um total/observação. */
export function CardDivider() {
  return <hr className="my-1 border-slate-100" />;
}
