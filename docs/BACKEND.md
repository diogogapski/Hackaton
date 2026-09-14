# Back-end HACKIF

Next.js App Router (`src/app/api`) + Prisma 7 + SQLite (dev) / PostgreSQL (Railway).
Planejamento de origem: `docs/00_PLANO_GERAL_BACKEND.md`, `docs/01_BACKEND_DEV1_IDENTIDADE_EQUIPES.md`,
`docs/02_BACKEND_DEV2_HACKATHON_AVALIACAO.md`.

## Rodando

```bash
npm install            # também roda `prisma generate`
cp .env.example .env   # e defina AUTH_SECRET
npm run db:migrate     # cria prisma/dev.db e aplica as migrations
npm run db:seed        # dados de teste
npm run dev
npm test               # testes unitários (ranking)
```

Contas do seed (senha `Senha@123`): `admin@hackif.dev`, `jurado@hackif.dev`, `jurado2@hackif.dev`,
`aluno@hackif.dev` (líder da "Equipe Exemplo", convite `HACKIF01`), `aluna2@hackif.dev`,
`servidor@hackif.dev`, `externo@hackif.dev`.

Scripts: `db:migrate`, `db:deploy`, `db:generate`, `db:seed`, `db:reset`, `db:studio`,
`db:pg:sync`, `db:pg:check`, `admin:create`.

## Estrutura

```
prisma/schema.prisma        schema único (Bloco A e Bloco B separados por seção)
prisma/seed.ts
src/lib/db.ts               PrismaClient (adapter escolhido pela DATABASE_URL)
src/lib/http.ts             route(), HttpError, parseBody/parseQuery (Zod)
src/lib/auth/               sessão JWT (cookie httpOnly), senha, rate limit, helpers
src/server/identidade/      Dev 1 — cadastro, schemas, alterarPapel
src/server/equipes/         Dev 1 — regras de equipe
src/server/hackathon/       Dev 2 — edição atual, schemas do bloco B
src/server/projetos/        Dev 2 — regras de submissão
src/server/avaliacao/       Dev 2 — ranking (puro + testes), resultados, atribuições
src/app/api/**/route.ts     handlers finos: autenticar → validar → chamar serviço
```

## Contrato entre os blocos

O Bloco B **só** usa estes helpers de `@/src/lib/auth` (dono: Dev 1):

| Função | Retorno |
|---|---|
| `getCurrentUser()` | usuário público ou `null` |
| `requireAuth()` | usuário; lança 401 |
| `requireRole("ADMIN")` / `requireRole(["JURADO","ADMIN"])` | usuário; lança 401/403 |
| `getCurrentUserTeam(hackathonId?)` | equipe ativa com `membros` e `lider`, ou `null` |

Mudança de papel (ex.: autorizar jurado) passa por `alterarPapel()` de `src/server/identidade/usuarios.ts`.
Jurado é `User` com `papel = JURADO`; não existe tabela própria.

Padrão de rota:

```ts
export const POST = route(async (request) => {
  const user = await requireRole("ADMIN");
  const data = await parseBody(request, meuSchema);
  return Response.json({ ... }, { status: 201 });
});
```

Erros saem como `{ error, details? }` com status 400/401/403/404/409/429/500.

## Endpoints

**Públicos:** `GET /api/hackathon/atual`, `/api/desafios`, `/api/agenda`, `/api/comunicados`, `/api/resultados`
(aceitam `?hackathonId=`).

**Auth (Dev 1):** `POST /api/auth/register/{aluno|servidor|externo}` (exige `aceiteTermos: true`),
`POST /api/auth/login` (`identificador` = e-mail, ou matrícula/SIAPE/CPF + `vinculo`),
`POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/recuperar-senha` (sem envio de e-mail; link só no console em dev),
`POST /api/auth/redefinir-senha`.

**Perfil:** `GET|PUT /api/perfil` (só nome, e-mail, telefone), `PUT /api/perfil/senha`.

**Equipe:** `GET|POST /api/equipe`, `POST /api/equipe/convite`, `POST /api/equipe/entrar`,
`POST /api/equipe/sair`, `POST /api/equipe/transferir-lideranca`, `DELETE /api/equipe/membro/:userId`.

**Projeto (Dev 2):** `GET|POST|PUT /api/projeto` — `enviar: true` submete para avaliação.

**Jurado:** `GET /api/jurado/projetos`, `GET|POST /api/jurado/avaliacao/:projetoId`.

**Admin (Dev 1):** `GET /api/admin/usuarios`, `PUT /api/admin/usuarios/:id/papel`,
`PUT /api/admin/usuarios/:id/situacao`, `GET /api/admin/equipes`, `PUT /api/admin/equipes/:id`.

**Admin (Dev 2):** `GET|POST /api/admin/hackathons`, `GET|PUT /api/admin/hackathons/:id`,
`GET|POST /api/admin/{desafios|agenda|criterios|comunicados}`, `PUT|DELETE /api/admin/{...}/:id`,
`GET /api/admin/projetos`, `GET|POST /api/admin/jurados`, `GET|POST /api/admin/jurados/:id/atribuicoes`,
`DELETE /api/admin/jurados/:id/atribuicoes/:projetoId`, `POST /api/admin/atribuicoes/distribuir`,
`GET /api/admin/avaliacoes`, `GET /api/admin/resultados`, `POST /api/admin/resultados/publicar`,
`GET /api/admin/dashboard`.

## Regras configuráveis (no banco, nada fixo no código)

| Regra | Onde |
|---|---|
| Mínimo/máximo de integrantes | `Hackathon.limiteMinIntegrantes` / `limiteMaxIntegrantes` |
| Janela de inscrição e prazo de submissão | `Hackathon.inscricaoInicio/Fim`, `prazoSubmissao` (nulo = `dataFim`) |
| Jurados por projeto (distribuição automática) | `Hackathon.juradosPorProjeto` |
| Jurado pode reenviar avaliação | `Hackathon.permitirEdicaoAvaliacao` |
| Publicação de resultados (sempre manual) | `Hackathon.resultadosPublicados` |
| Mostrar notas no resultado público | `Hackathon.exibirNotasPublicas` |
| Critérios e pesos | `Criterio.peso` |
| Escala de notas (a mesma para todos os critérios) | `Hackathon.notaMin` / `notaMax` (travada após a 1ª avaliação) |
| Ordem de desempate | `Criterio.prioridadeDesempate` (menor primeiro), depois ordem de envio |

Situação da equipe é recalculada automaticamente: `EM_FORMACAO` abaixo do mínimo, `INSCRITA` a partir dele;
`DESCLASSIFICADA` só muda pelo admin. Membros saem com soft-delete (`TeamMember.saiuEm`); se o líder sai,
o membro mais antigo é promovido.

Nota final = `soma(média_do_critério × peso) / soma(pesos)`, com todos os critérios na mesma escala.

Rate limit: tentativas malsucedidas contadas **por IP** na tabela `TentativaAcesso` (vale com várias
instâncias). Padrão: 20 falhas de login por IP a cada 15 min e 5 pedidos de recuperação por hora —
ajustável por `LOGIN_MAX_TENTATIVAS_POR_IP`, `LOGIN_JANELA_MINUTOS`, `RECUPERAR_SENHA_MAX_POR_IP`.
O limite é folgado porque laboratórios do campus costumam sair pelo mesmo IP.

## SQLite (dev) e PostgreSQL (Railway)

A `DATABASE_URL` decide tudo (`prisma.config.ts` e `src/lib/db.ts`):

| URL | Schema | Migrations | Adapter |
|---|---|---|---|
| `file:...` | `prisma/schema.prisma` | `prisma/migrations` | better-sqlite3 |
| `postgres...` | `prisma/postgres/schema.prisma` (gerado) | `prisma/postgres/migrations` | pg |

**Fonte da verdade é `prisma/schema.prisma`.** Ao mudar o schema:

```bash
npm run db:migrate -- --name minha_mudanca   # migration SQLite (dev)
npm run db:pg:sync -- minha_mudanca          # regenera o schema Postgres + migration Postgres (não precisa de Postgres rodando)
```

O `npm run build` falha se o schema Postgres estiver desatualizado (`prebuild` → `db:pg:check`).
Commite as duas pastas de migrations.

## Deploy na Railway

Já configurado em `railway.json` (Railpack, `preDeployCommand: npm run db:deploy`, healthcheck `/api/health`).

1. Crie um serviço **PostgreSQL** e o serviço da aplicação a partir do repositório.
2. Variáveis do serviço da aplicação:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (precisa existir também no build, para gerar o client Postgres)
   - `AUTH_SECRET` = valor aleatório longo
   - `APP_URL` = URL pública do serviço
   - opcionais: `LOGIN_MAX_TENTATIVAS_POR_IP`, `LOGIN_JANELA_MINUTOS`, `RECUPERAR_SENHA_MAX_POR_IP`
3. Deploy. As migrations rodam no pre-deploy; `/api/health` responde 200 quando o banco está acessível.
4. Crie o primeiro admin (o seed é bloqueado em produção). Localmente, com a URL **pública** do Postgres:

   ```bash
   DATABASE_URL="<DATABASE_PUBLIC_URL da Railway>" ADMIN_EMAIL=... ADMIN_SENHA=... ADMIN_NOME="..." npm run admin:create
   ```

Validado localmente contra PostgreSQL (build de produção + `next start` + teste ponta a ponta).

Diferença conhecida: buscas `contains` em `admin/usuarios` e `admin/equipes` ignoram maiúsculas no
SQLite, mas diferenciam no Postgres.