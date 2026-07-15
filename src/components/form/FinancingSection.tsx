import type { FormState } from '../../types';
import {
  CurrencyInput,
  Field,
  NumberInput,
  SegmentedControl,
  ToggleAmountInput,
} from './inputs';
import { Section } from './Section';

interface Props {
  form: FormState;
  setField: (patch: Partial<FormState>) => void;
}

export function FinancingSection({ form, setField }: Props) {
  const financiado = form.paymentMode === 'financed';

  return (
    <Section step={3} title="Condições de Pagamento">
      <div className="sm:col-span-2">
        <Field label="Forma de pagamento">
          {/* Futuro: adicionar 'judicial' (parcelamento no processo) — o tipo
              PaymentMode e o SegmentedControl já suportam novas opções. */}
          <SegmentedControl
            value={form.paymentMode}
            onChange={(paymentMode) => setField({ paymentMode })}
            options={[
              { value: 'financed', label: 'Financiado' },
              { value: 'cash', label: 'À vista' },
            ]}
          />
        </Field>
      </div>

      {financiado && (
        <>
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
              placeholder="Ex.: 420"
            />
          </Field>
          <Field
            label="Taxa de juros (% a.m.)"
            hint="Opcional. Usada se a parcela não for informada."
          >
            <NumberInput
              value={form.taxaJurosMensal ?? 0}
              onChange={(v) => setField({ taxaJurosMensal: v > 0 ? v : null })}
              placeholder="Ex.: 1"
              suffix="%"
            />
          </Field>
          <Field label="Parcela" hint="Opcional. Se informada, tem prioridade sobre a taxa.">
            <CurrencyInput
              value={form.parcela ?? 0}
              onChange={(v) => setField({ parcela: v > 0 ? v : null })}
            />
          </Field>
        </>
      )}
    </Section>
  );
}
