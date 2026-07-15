import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  step: number;
  children: ReactNode;
}

export function Section({ title, step, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          {step}
        </span>
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
