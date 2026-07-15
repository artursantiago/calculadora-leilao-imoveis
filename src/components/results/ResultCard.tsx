import type { ReactNode } from 'react';

interface ResultCardProps {
  title: string;
  value: string;
  children?: ReactNode;
}

export function ResultCard({ title, value, children }: ResultCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="text-sm font-medium text-slate-500">{title}</span>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      {children}
    </div>
  );
}
