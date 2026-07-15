import type { FormState } from '../../types';
import { CurrencyInput, Field, NumberInput, ToggleAmountInput } from './inputs';
import { Section } from './Section';

interface Props {
  form: FormState;
  setField: (patch: Partial<FormState>) => void;
}

export function FinancingSection({ form, setField }: Props) {
  return (
    <Section step={3} title="Financiamento">
      <ToggleAmountInput
        label="Entrada"
        hint="Percentual ou valor sobre a arrematação."
        dual={form.entrada}
        onChange={(entrada) => setField({ entrada })}
      />
      <Field label="Prazo (meses)">
        <NumberInput
          value={form.prazoMeses}
          onChange={(v) => setField({ prazoMeses: v })}
        />
      </Field>
      <Field label="Taxa de juros (% a.a.)" hint="Opcional. Usada se a parcela não for informada.">
        <NumberInput
          value={form.taxaJurosAnual ?? 0}
          onChange={(v) => setField({ taxaJurosAnual: v > 0 ? v : null })}
          suffix="%"
        />
      </Field>
      <Field label="Parcela" hint="Opcional. Se informada, tem prioridade sobre a taxa.">
        <CurrencyInput
          value={form.parcela ?? 0}
          onChange={(v) => setField({ parcela: v > 0 ? v : null })}
        />
      </Field>
    </Section>
  );
}
