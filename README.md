# HACKIF

Sistema web do 1º Hackathon do curso de Ciência da Computação do IFPR Campus Pinhais: site público do
evento, inscrição de participantes e equipes, submissão de projetos, avaliação por jurados e publicação
de resultados.

## Tecnologias

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4, lucide-react, framer-motion
- API em Route Handlers (`src/app/api`)
- Prisma 7 — SQLite em desenvolvimento, PostgreSQL em produção (Railway)
- Autenticação por JWT em cookie httpOnly (jose) e senhas com bcrypt
- Validação com Zod

Requer Node.js 20.19 ou superior.

## Como rodar

```bash
npm install                 # instala e gera o Prisma Client
cp .env.example .env        # troque AUTH_SECRET por um valor aleatório
npm run db:migrate          # cria prisma/dev.db com as migrations
npm run db:seed             # dados de exemplo
npm run dev
```

Acesse http://localhost:3000. Contas do seed (senha `Senha@123`):

| E-mail | Papel |
|---|---|
| `admin@hackif.dev` | Admin |
| `jurado@hackif.dev` | Jurado |
| `aluno@hackif.dev` | Participante, líder da "Equipe Exemplo" (convite `HACKIF01`) |

## Áreas

| Rota | Para quem |
|---|---|
| `/`, `/sobre`, `/hackathon`, `/resultados`, `/regulamento` | Público |
| `/cadastro`, `/entrar`, `/recuperar-senha`, `/redefinir-senha` | Acesso |
| `/participante/equipe`, `/participante/projeto` | Participantes |
| `/jurado` | Jurados |
| `/admin` | Organização |
| `/conta` | Qualquer usuário logado |

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm start` | build e servidor de produção |
| `npm run lint` | ESLint |
| `npm test` | testes unitários (ranking) |
| `npm run test:fluxo` | fluxo completo da API sobre banco vazio (ver `docs/BACKEND.md`) |
| `npm run db:migrate` | cria/aplica migrations no SQLite |
| `npm run db:pg:sync` | gera schema e migration do PostgreSQL a partir do schema principal |
| `npm run db:seed` / `npm run db:reset` | popula / recria o banco local |
| `npm run db:studio` | Prisma Studio |
| `npm run admin:create` | cria o primeiro admin em produção |

## Documentação

- [docs/BACKEND.md](docs/BACKEND.md) — API, contrato entre os blocos, regras configuráveis, deploy na Railway
- [docs/FRONTEND.md](docs/FRONTEND.md) — identidade visual e componentes
- [docs/00_PLANO_GERAL_BACKEND.md](docs/00_PLANO_GERAL_BACKEND.md), [01](docs/01_BACKEND_DEV1_IDENTIDADE_EQUIPES.md) e [02](docs/02_BACKEND_DEV2_HACKATHON_AVALIACAO.md) — planejamento e divisão entre os devs
