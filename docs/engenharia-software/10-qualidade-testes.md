# Qualidade e testes

## Testes automatizados

O comando `npm test` usa `tsx --test` e possui testes unitários reais, incluindo:

- `src/server/avaliacao/ranking.test.ts`: cálculo, pesos, empates e posições.
- `src/lib/auth/rate-limit.test.ts`: seleção de IP e hash da chave de conta.
- `src/lib/http.test.ts`: validação de origem e limite de corpo JSON.
- `src/lib/database-url.test.ts`: resolução SQLite/PostgreSQL/Railway.
- `src/server/email/*.test.ts`, `src/server/hackathon/*.test.ts` e `src/server/operacao/csv.test.ts`.

O script `scripts/teste-fluxo.mjs` executa testes de fluxo ponta a ponta sobre banco vazio. Ele exercita cadastro, verificação de e-mail, login, equipes, edição, projetos, avaliações, resultados, presença, relatórios, sessão, CSRF e anonimização.

## CI

`.github/workflows/ci.yml` executa em push para `main` e em Pull Requests. Há dois jobs: SQLite, para desenvolvimento, e PostgreSQL 16, correspondente ao ambiente de produção na Railway. Eles instalam dependências, executam lint e testes, aplicam migrations, realizam build e executam o fluxo ponta a ponta.

## Outras práticas observadas

O ESLint é executado por `npm run lint`. Validações de entrada usam Zod; erros HTTP são padronizados; e constraints do banco complementam as validações da aplicação. O fluxo de integração utiliza branches e Pull Requests no GitHub.
