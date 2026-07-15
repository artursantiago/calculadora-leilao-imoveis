import type { FormState } from '../../types';
import { CurrencyInput, Field, NumberInput, TextInput } from './inputs';
import { Section } from './Section';

interface Props {
  form: FormState;
  setField: (patch: Partial<FormState>) => void;
}

export function PropertySection({ form, setField }: Props) {
  return (
    <Section step={1} title="Informações do imóvel">
      <Field label="Valor da arrematação">
        <CurrencyInput
          value={form.arrematacao}
          onChange={(v) => setField({ arrematacao: v })}
        />
      </Field>
      <Field label="Valor de avaliação do banco">
        <CurrencyInput
          value={form.avaliacaoBanco}
          onChange={(v) => setField({ avaliacaoBanco: v })}
        />
      </Field>
      <Field label="Valor de mercado" hint="Se vazio, usa a avaliação do banco.">
        <CurrencyInput
          value={form.valorMercado ?? 0}
          onChange={(v) => setField({ valorMercado: v > 0 ? v : null })}
        />
      </Field>
      <Field label="Área (m²)">
        <NumberInput value={form.area} onChange={(v) => setField({ area: v })} />
      </Field>
      <Field label="Cidade">
        <TextInput value={form.cidade} onChange={(v) => setField({ cidade: v })} />
      </Field>
      <Field label="Bairro">
        <TextInput value={form.bairro} onChange={(v) => setField({ bairro: v })} />
      </Field>
    </Section>
  );
}
