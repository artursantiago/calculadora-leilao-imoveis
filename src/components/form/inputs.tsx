import { useEffect, useState, type ReactNode } from 'react';
import type { DualAmount } from '../../types';
import { formatBRL } from '../../utils/formatters';

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 ' +
  'placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 ' +
  'focus:ring-indigo-200';

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

// --- Texto simples --------------------------------------------------------
interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function TextInput({ value, onChange, placeholder }: TextInputProps) {
  return (
    <input
      type="text"
      className={inputClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// --- Máscara monetária (R$) ----------------------------------------------
// Os dígitos são interpretados como centavos: "200000" → R$ 2.000,00.
interface CurrencyInputProps {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}

export function CurrencyInput({ value, onChange, placeholder }: CurrencyInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      className={inputClass}
      value={value ? formatBRL(value) : ''}
      placeholder={placeholder ?? 'R$ 0,00'}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '');
        onChange(digits ? Number(digits) / 100 : 0);
      }}
    />
  );
}

// --- Número com vírgula decimal (percentuais, prazo etc.) ------------------
function parseNum(raw: string): number {
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  suffix?: string;
}

export function NumberInput({ value, onChange, placeholder, suffix }: NumberInputProps) {
  const [buf, setBuf] = useState(value ? String(value).replace('.', ',') : '');

  // Sincroniza quando o valor muda externamente (ex.: reset ou defaults).
  useEffect(() => {
    if (parseNum(buf) !== value) {
      setBuf(value ? String(value).replace('.', ',') : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const field = (
    <input
      type="text"
      inputMode="decimal"
      className={inputClass}
      value={buf}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d.,]/g, '');
        setBuf(raw);
        onChange(parseNum(raw));
      }}
    />
  );

  if (!suffix) return field;
  return (
    <div className="relative">
      {field}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        {suffix}
      </span>
    </div>
  );
}

// --- Checkbox -------------------------------------------------------------
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

// --- Controle segmentado (ex.: À vista / Financiado) ----------------------
interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={
            'px-4 py-2 text-sm font-medium transition ' +
            (value === opt.value
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// --- Campo "% ou R$" com alternância --------------------------------------
interface ToggleAmountInputProps {
  label: string;
  hint?: string;
  dual: DualAmount;
  onChange: (dual: DualAmount) => void;
}

export function ToggleAmountInput({ label, hint, dual, onChange }: ToggleAmountInputProps) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
          {(['percent', 'value'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ ...dual, mode })}
              className={
                'px-3 py-2 text-sm font-medium transition ' +
                (dual.mode === mode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50')
              }
            >
              {mode === 'percent' ? '%' : 'R$'}
            </button>
          ))}
        </div>
        <div className="flex-1">
          {dual.mode === 'percent' ? (
            <NumberInput
              value={dual.value}
              onChange={(v) => onChange({ ...dual, value: v })}
              suffix="%"
            />
          ) : (
            <CurrencyInput
              value={dual.value}
              onChange={(v) => onChange({ ...dual, value: v })}
            />
          )}
        </div>
      </div>
    </Field>
  );
}
