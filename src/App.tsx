import { useRef } from 'react';
import { Header } from './components/Header';
import { CostsSection } from './components/form/CostsSection';
import { FinancingSection } from './components/form/FinancingSection';
import { PropertySection } from './components/form/PropertySection';
import { RevenueSection } from './components/form/RevenueSection';
import { ExportButtons } from './components/ExportButtons';
import { ResultsPanel } from './components/results/ResultsPanel';
import { useCalculator } from './hooks/useCalculator';

export default function App() {
  const { form, setField, results, calculate } = useCalculator();
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleCalculate() {
    calculate();
    // Rola até os resultados após o cálculo (útil no mobile).
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Header />

        <div className="flex flex-col gap-5">
          <PropertySection form={form} setField={setField} />
          <CostsSection form={form} setField={setField} />
          <FinancingSection form={form} setField={setField} />
          <RevenueSection form={form} setField={setField} />
        </div>

        <div className="my-8 flex justify-center">
          <button
            type="button"
            onClick={handleCalculate}
            className="rounded-xl bg-indigo-600 px-10 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            Calcular
          </button>
        </div>

        <div ref={resultsRef}>
          {results && (
            <div className="flex flex-col gap-8">
              <ResultsPanel form={form} results={results} />
              <ExportButtons form={form} results={results} />
            </div>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Ferramenta de apoio à decisão. Os indicadores não substituem a análise do
          investidor.
        </footer>
      </div>
    </div>
  );
}
