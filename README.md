# calculadora-leilao-imoveis

Calculadora de investimento em **leilões de imóveis** para a estratégia **Buy & Hold**
(comprar, financiar, alugar e construir patrimônio). Aplicação web estática, sem
backend — toda a lógica roda no navegador.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Deploy: GitHub Pages (via GitHub Actions)

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + build de produção em dist/
npm run preview  # pré-visualiza o build
```

## Arquitetura

Toda a regra de negócio vive em funções puras em `src/utils/`, e todos os
parâmetros/limites de classificação em `src/constants.ts`:

- `utils/calculations.ts` — investimento total, capital inicial, receita líquida,
  fluxo de caixa, yields, margem, desconto, alavancagem e ICP.
- `utils/financing.ts` — parcela (informada ou via Tabela Price). A taxa de juros
  é interpretada como **% ao ano** e convertida para taxa efetiva mensal.
- `utils/classification.ts` — mapeia valores para 🟢/🟡/🟠/🔴 conforme as faixas.
- `utils/summary.ts` — resumo executivo por regras condicionais (sem IA).
- `utils/export.ts` — relatório em texto, copiar para clipboard e abrir ChatGPT.

Os componentes (`src/components/`) apenas consomem essas funções.

## Deploy (GitHub Pages)

O workflow `.github/workflows/deploy.yml` faz build e publica em cada push para
`master`. Habilite **Settings → Pages → Source: GitHub Actions** no repositório.
O `base` do Vite já aponta para `/calculadora-leilao-imoveis/`.
