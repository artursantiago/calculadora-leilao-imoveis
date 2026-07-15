import { useState } from 'react';
import type { ScaleRange } from '../../constants';

interface Operand {
  label: string;
  value: string;
}

export interface Formula {
  a: Operand;
  op: string; // ÷, −, ×
  b: Operand;
  result: Operand;
}

export interface Scale {
  rows: ScaleRange[];
  activeLabel: string;
}

interface InterpretPanelProps {
  concept: string;
  formula: Formula;
  scale?: Scale;
  levers: string[];
}

function OperandBox({ operand, highlight }: { operand: Operand; highlight?: boolean }) {
  return (
    <div
      className={
        'flex min-w-[5.5rem] flex-col items-center rounded-lg border px-3 py-1.5 text-center ' +
        (highlight
          ? 'border-indigo-200 bg-indigo-50'
          : 'border-slate-200 bg-slate-50')
      }
    >
      <span className="text-[11px] leading-tight text-slate-500">{operand.label}</span>
      <span
        className={
          'text-sm font-semibold ' + (highlight ? 'text-indigo-700' : 'text-slate-800')
        }
      >
        {operand.value}
      </span>
    </div>
  );
}

export function InterpretPanel({ concept, formula, scale, levers }: InterpretPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-1 border-t border-slate-100 pt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
      >
        <span className={'transition-transform ' + (open ? 'rotate-90' : '')}>›</span>
        Como interpretar?
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-4 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              O que mede
            </p>
            <p className="leading-relaxed text-slate-600">{concept}</p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Como é calculado
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <OperandBox operand={formula.a} />
              <span className="text-lg font-semibold text-slate-400">{formula.op}</span>
              <OperandBox operand={formula.b} />
              <span className="text-lg font-semibold text-slate-400">=</span>
              <OperandBox operand={formula.result} highlight />
            </div>
          </div>

          {scale && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Escala
              </p>
              <ul className="flex flex-col gap-0.5">
                {scale.rows.map((row) => {
                  const active = row.label === scale.activeLabel;
                  return (
                    <li
                      key={row.label}
                      className={
                        'flex items-center justify-between rounded-md px-2 py-1 ' +
                        (active ? 'bg-slate-100 font-semibold text-slate-800' : 'text-slate-500')
                      }
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{row.emoji}</span>
                        {row.label}
                        {active && (
                          <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            você
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums text-xs">{row.range}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Como melhorar
            </p>
            <ul className="flex list-disc flex-col gap-0.5 pl-4 text-slate-600">
              {levers.map((lever) => (
                <li key={lever}>{lever}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
