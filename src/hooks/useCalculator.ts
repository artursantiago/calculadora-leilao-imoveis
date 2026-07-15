import { useState } from 'react';
import { defaultFormState } from '../constants';
import type { FormState, Results } from '../types';
import { computeResults } from '../utils/calculations';

export function useCalculator() {
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [results, setResults] = useState<Results | null>(null);

  /** Atualiza um ou mais campos do formulário. */
  function setField(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  /** Recalcula os resultados a partir do estado atual do formulário. */
  function calculate() {
    setResults(computeResults(form));
  }

  function reset() {
    setForm(defaultFormState);
    setResults(null);
  }

  return { form, setField, results, calculate, reset };
}
