import type { FormState } from '../../types';
import { CurrencyInput, Field, ToggleAmountInput } from './inputs';
import { Section } from './Section';

interface Props {
  form: FormState;
  setField: (patch: Partial<FormState>) => void;
}

export function CostsSection({ form, setField }: Props) {
  return (
    <Section step={2} title="Custos da aquisição">
      <ToggleAmountInput
        label="Comissão do leiloeiro"
        hint="Padrão 5% sobre a arrematação."
        dual={form.comissao}
        onChange={(comissao) => setField({ comissao })}
      />
      <ToggleAmountInput
        label="Assessoria"
        hint="Padrão 15% sobre a arrematação."
        dual={form.assessoria}
        onChange={(assessoria) => setField({ assessoria })}
      />
      <Field label="Reforma">
        <CurrencyInput
          value={form.reforma}
          onChange={(v) => setField({ reforma: v })}
          placeholder="Ex.: 14000"
        />
      </Field>
      <Field label="Desocupação">
        <CurrencyInput
          value={form.desocupacao}
          onChange={(v) => setField({ desocupacao: v })}
          placeholder="Ex.: 2000"
        />
      </Field>
      <ToggleAmountInput
        label="ITBI"
        hint="Padrão 3% sobre a arrematação (alíquota municipal, editável)."
        dual={form.itbi}
        onChange={(itbi) => setField({ itbi })}
      />
      <Field label="Registro">
        <CurrencyInput
          value={form.registro}
          onChange={(v) => setField({ registro: v })}
          placeholder="Ex.: 3500"
        />
      </Field>
      <Field label="Outros custos">
        <CurrencyInput value={form.outros} onChange={(v) => setField({ outros: v })} />
      </Field>
    </Section>
  );
}
