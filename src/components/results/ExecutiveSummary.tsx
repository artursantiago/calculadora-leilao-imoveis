import type { Results } from '../../types';
import { buildExecutiveSummary } from '../../utils/summary';

export function ExecutiveSummary({ results }: { results: Results }) {
  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <h3 className="mb-2 text-lg font-semibold text-indigo-900">Resumo executivo</h3>
      <p className="text-sm leading-relaxed text-indigo-900">
        {buildExecutiveSummary(results)}
      </p>
    </section>
  );
}
