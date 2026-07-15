import { useState } from 'react';
import type { FormState, Results } from '../types';
import { buildReportText, copyToClipboard, openChatGPT } from '../utils/export';

interface Props {
  form: FormState;
  results: Results;
}

export function ExportButtons({ form, results }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleCopy() {
    const ok = await copyToClipboard(buildReportText(form, results));
    setMessage(ok ? 'Resultados copiados!' : 'Não foi possível copiar automaticamente.');
  }

  async function handleChatGPT() {
    const copied = await openChatGPT(buildReportText(form, results));
    setMessage(
      copied
        ? 'ChatGPT aberto. O texto também foi copiado — cole no chat se necessário.'
        : 'ChatGPT aberto. Copie o texto manualmente e cole no chat.',
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Copiar Resultados
        </button>
        <button
          type="button"
          onClick={handleChatGPT}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700"
        >
          Abrir ChatGPT
        </button>
      </div>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}
