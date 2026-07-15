import type { FormState } from '../../types';
import { CurrencyInput, Field, NumberInput, ToggleAmountInput } from './inputs';
import { Section } from './Section';

interface Props {
  form: FormState;
  setField: (patch: Partial<FormState>) => void;
}

export function RevenueSection({ form, setField }: Props) {
  return (
    <Section step={4} title="Receita">
      <Field label="Aluguel esperado">
        <CurrencyInput value={form.aluguel} onChange={(v) => setField({ aluguel: v })} />
      </Field>
      <Field label="Administração da imobiliária" hint="Padrão 10% do aluguel.">
        <NumberInput
          value={form.administracao}
          onChange={(v) => setField({ administracao: v })}
          suffix="%"
        />
      </Field>
      <Field label="Condomínio (mensal)">
        <CurrencyInput
          value={form.condominio}
          onChange={(v) => setField({ condominio: v })}
        />
      </Field>
      <Field label="IPTU (mensal)">
        <CurrencyInput value={form.iptu} onChange={(v) => setField({ iptu: v })} />
      </Field>
      <Field label="Seguro (mensal)">
        <CurrencyInput value={form.seguro} onChange={(v) => setField({ seguro: v })} />
      </Field>
      <ToggleAmountInput
        label="Reserva para manutenção"
        hint="Valor fixo ou percentual do aluguel."
        dual={form.reservaManutencao}
        onChange={(reservaManutencao) => setField({ reservaManutencao })}
      />
      <Field label="Vacância" hint="Padrão 5% do aluguel.">
        <NumberInput
          value={form.vacancia}
          onChange={(v) => setField({ vacancia: v })}
          suffix="%"
        />
      </Field>
    </Section>
  );
}
