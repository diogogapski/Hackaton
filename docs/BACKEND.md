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
`db:pg:sync`, `db:pg:check`, `admin:create`, `test`, `test:fluxo`.

## Testes

| Comando | Cobre |
|---|---|
| `npm test` | ranking (média ponderada, desempates, empates) e checagem de origem contra CSRF |
| `npm run test:fluxo` | fluxo inteiro sobre banco vazio (~170 verificações): edição, conteúdo, cadastro, login, perfil, recuperação de senha, equipes, submissão, jurados, avaliação, apuração, publicação, Home, admin, prazos, sessão, CSRF e exclusão de conta; também falha se alguma resposta expuser hash ou senha |

O GitHub Actions (`.github/workflows/ci.yml`) roda a cada push dois jobs: SQLite (lint, testes, build e `test:fluxo`) e PostgreSQL 16 real (build antes das migrations, como na Railway, depois migrations e `test:fluxo`).
Para rodar o fluxo localmente, veja as instruções no topo de `scripts/teste-fluxo.mjs`.

## Estrutura

```
prisma/schema.prisma        schema único (Bloco A e Bloco B separados por seção)
prisma/seed.ts
src/lib/db.ts               PrismaClient (adapter escolhido pela DATABASE_URL) e contem()
src/lib/api-client.ts       fetch do front para a API
src/components/ui/app.tsx   componentes das áreas logadas
src/lib/http.ts             route(), HttpError, parseBody/parseQuery (Zod)
src/lib/auth/               sessão JWT (cookie httpOnly), senha, rate limit, helpers
src/server/identidade/      Dev 1 — cadastro, schemas, alterarPapel
src/server/equipes/         Dev 1 — regras de equipe
src/server/hackathon/       Dev 2 — edição atual, schemas do bloco B
src/server/projetos/        Dev 2 — regras de submissão
src/server/avaliacao/       Dev 2 — ranking (puro + testes), resultados, atribuições
src/server/home/            dados da edição vigente para a Home
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

**Perfil:** `GET|PUT /api/perfil` (só nome, e-mail, telefone), `DELETE /api/perfil` (exclusão da conta, exige senha), `PUT /api/perfil/senha`.

**Equipe:** `GET|POST /api/equipe`, `POST /api/equipe/convite`, `POST /api/equipe/entrar`,
`POST /api/equipe/sair`, `POST /api/equipe/transferir-lideranca`, `DELETE /api/equipe/membro/:userId`.

**Projeto (Dev 2):** `GET|POST|PUT /api/projeto` — `enviar: true` submete para avaliação.

**Jurado:** `GET /api/jurado/projetos`, `GET|POST /api/jurado/avaliacao/:projetoId`.

**Admin (Dev 1):** `GET /api/admin/usuarios`, `PUT /api/admin/usuarios/:id/papel`,
`PUT /api/admin/usuarios/:id/situacao`, `GET /api/admin/equipes`, `PUT /api/admin/equipes/:id`.

**Admin (Dev 2):** `GET|POST /api/admin/hackathons`, `GET|PUT /api/admin/hackathons/:id`,
`GET|POST /api/admin/{desafios|agenda|criterios|comunicados}`, `PUT|DELETE /api/admin/{...}/:id`,
`GET /api/admin/projetos`, `PUT /api/admin/projetos/:id` (`DESCLASSIFICADO`/`ATIVO`), `GET|POST /api/admin/jurados`, `GET|POST /api/admin/jurados/:id/atribuicoes`,
`DELETE /api/admin/jurados/:id/atribuicoes/:projetoId`, `POST /api/admin/atribuicoes/distribuir`,
`GET /api/admin/avaliacoes`, `GET /api/admin/resultados`, `POST /api/admin/resultados/publicar`,
`GET /api/admin/dashboard`.

**Admin (operação):** `POST /api/admin/jurados/convidar` (cria JURADO e devolve link para definir senha),
`POST /api/admin/avaliacoes/corrigir` (correção de nota com justificativa, antes da publicação),
`GET /api/admin/projetos/:id/registros` (histórico: lançamento, alteração do jurado, correção da comissão),
`GET|POST /api/admin/presencas`, `GET /api/admin/relatorio`, `GET /api/admin/relatorio/{participantes|equipes|resultado}` (CSV),
`GET|POST /api/admin/lgpd/descarte` (prévia / anonimização com `{ confirmar: true }`).
Telas no menu admin: `/admin/operacao`, `/admin/presenca`, `/admin/relatorio`.
Estado detalhado e pendências: `docs/ESTADO_ATUAL.md`.

## Telas

Front funcional sobre a API, com a mesma identidade visual da Home. Áreas logadas são protegidas no
layout (`getCurrentUser` + `redirect`); menus por papel em `src/components/layout/navegacao.ts`.

| Rota | Quem | O que faz |
|---|---|---|
| `/cadastro` | público | cadastro de aluno, servidor ou egresso/externo, com aceite dos termos |
| `/entrar` | público | login por e-mail ou matrícula/SIAPE/CPF + vínculo; redireciona pelo papel |
| `/recuperar-senha`, `/redefinir-senha` | público | gera o link (console em dev) e define nova senha |
| `/hackathon` | público | edição atual, desafios publicados, agenda, comunicados |
| `/resultados` | público | pódio e ranking após publicação (notas só se `exibirNotasPublicas`) |
| `/regulamento` | público | `Hackathon.regulamentoTexto` e link para `regulamentoUrl` |
| `/conta` | logado | perfil (nome, e-mail, telefone), troca de senha e exclusão da conta |
| `/participante/equipe` | PARTICIPANTE | criar/entrar por código, convite, remover, transferir liderança, sair |
| `/participante/projeto` | PARTICIPANTE | cadastrar, editar e enviar o projeto da equipe |
| `/jurado`, `/jurado/avaliacao/:id` | JURADO | projetos atribuídos, notas por critério, prévia ponderada |
| `/admin` | ADMIN | dashboard + seletor de edição (padrão: edição atual) |
| `/admin/usuarios` | ADMIN | busca, filtros, papel e bloqueio |
| `/admin/equipes` | ADMIN | integrantes, liderança, desclassificação |
| `/admin/edicoes` | ADMIN | datas, limites de equipe, jurados por projeto, escala, visibilidade |
| `/admin/desafios`, `/agenda`, `/criterios`, `/comunicados` | ADMIN | CRUD |
| `/admin/projetos` | ADMIN | submissões, jurados atribuídos, desclassificar/reativar |
| `/admin/jurados` | ADMIN | autorizar jurado, distribuir automaticamente, atribuir/remover manualmente |
| `/admin/avaliacoes` | ADMIN | progresso por jurado e por projeto |
| `/admin/resultados` | ADMIN | prévia do ranking, publicar/despublicar |

Roteiro ponta a ponta com o seed:

1. `/cadastro` → crie contas; em `/participante/equipe` crie uma equipe e entre com as outras pelo código.
2. `admin@hackif.dev` → Critérios/Edições: ajuste pesos e escala.
3. `aluno@hackif.dev` → Projeto: edite e envie (a equipe do seed já tem 3 integrantes).
4. `admin@hackif.dev` → Jurados: **Distribuir automaticamente**.
5. `jurado@hackif.dev` → avalie o projeto.
6. `admin@hackif.dev` → Avaliações → Resultados → **Publicar**.
7. Sem login → `/resultados`.

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
| Limite de equipes inscritas (excedentes vão para `LISTA_ESPERA`) | `Hackathon.limiteEquipes` (nulo = sem limite) |
| Comunicado automático ao mudar a agenda | `Hackathon.comunicarMudancasAgenda` |
| Retenção de dados pessoais após o fim | `Hackathon.retencaoDadosDias` (nulo = sem descarte) |

Situação da equipe é recalculada automaticamente: `EM_FORMACAO` abaixo do mínimo, `INSCRITA` a partir dele;
`DESCLASSIFICADA` só muda pelo admin. Membros saem com soft-delete (`TeamMember.saiuEm`); se o líder sai,
o membro mais antigo é promovido.

Nota final = `soma(média_do_critério × peso) / soma(pesos)`, com todos os critérios na mesma escala.

Rate limit: tentativas malsucedidas contadas **por IP** na tabela `TentativaAcesso` (vale com várias
instâncias). Padrão: 20 falhas de login por IP a cada 15 min e 5 pedidos de recuperação por hora —
ajustável por `LOGIN_MAX_TENTATIVAS_POR_IP`, `LOGIN_JANELA_MINUTOS`, `RECUPERAR_SENHA_MAX_POR_IP`.
O limite é folgado porque laboratórios do campus costumam sair pelo mesmo IP.

## Segurança e LGPD

- **Sessão:** JWT HS256 em cookie `httpOnly`, `SameSite=Lax`, `Secure` em produção, validade de 7 dias.
  A cada requisição o usuário é relido do banco: conta bloqueada ou anonimizada perde o acesso na hora.
- **Sessões antigas:** trocar a senha (`PUT /api/perfil/senha`) ou redefini-la pelo link grava
  `User.sessoesValidasApos`; sessões emitidas antes disso deixam de valer. Quem trocou a senha continua
  logado (recebe um cookie novo).
- **Token de redefinição:** guardado só como hash SHA-256, válido por 1 hora e consumido de forma atômica
  (duas requisições simultâneas com o mesmo token: só uma vence).
- **CSRF:** além do `SameSite`, `route()` recusa (403) `POST/PUT/PATCH/DELETE` cujo cabeçalho `Origin`
  não corresponda ao host da aplicação (`x-forwarded-host`, `host` ou `APP_URL`).
- **Dados sensíveis:** respostas usam `publicUserSelect` (nunca `senhaHash`); o `test:fluxo` falha se
  algum hash ou senha aparecer em qualquer resposta.
- **Exclusão de conta (LGPD):** `DELETE /api/perfil` com `{ senha }` anonimiza a conta — apaga nome,
  e-mail, matrícula, SIAPE, CPF, curso e telefone, tira a pessoa da equipe, invalida a senha e as sessões
  e marca `anonimizadoEm`. Equipes, projetos e avaliações continuam existindo, sem identificar o titular;
  e-mail e documentos ficam livres para novo cadastro. O último administrador não pode se excluir, e conta
  anonimizada não pode ser reativada nem receber papel.

## Conformidade com os documentos de planejamento

Conferido contra `00_PLANO_GERAL_BACKEND.md`, `01_BACKEND_DEV1_IDENTIDADE_EQUIPES.md` e
`02_BACKEND_DEV2_HACKATHON_AVALIACAO.md`: todos os endpoints listados existem com os métodos citados,
todas as tabelas e campos estão no schema e as regras de negócio são verificadas por `npm run test:fluxo`.
O seed atende aos dois checklists (1 hackathon, 2 desafios, 1 projeto, critérios, 1 admin, alunos e 1 externo).

Diferenças em relação aos documentos, decididas pela equipe durante a implementação:

| Documento | Implementado | Motivo |
|---|---|---|
| Postgres local via Docker em dev | SQLite em dev, PostgreSQL só na Railway | decisão da equipe; schema portável |
| `getUsuarioLogado()` / `getEquipeDoUsuario()` | `getCurrentUser()` / `getCurrentUserTeam()` (+ `requireAuth`, `requireRole`) | nomes definidos pela equipe |
| Campos em snake_case | camelCase (`senhaHash`, `termosAceitosEm`…) | convenção do Prisma/TypeScript |
| `Criterio.nota_min/nota_max` | `Hackathon.notaMin/notaMax` | todos os critérios usam a mesma escala |
| Rate limit por IP + usuário (5/15 min) | por IP, persistido no banco (20/15 min, configurável) | decisão da equipe; laboratórios compartilham IP |
| Recuperação dispara e-mail | token gerado; link só no console em dev | envio de e-mail fora do escopo |
| Limite de 3–5 integrantes | `Hackathon.limiteMin/MaxIntegrantes` (padrão 3/5) | regras configuráveis no banco |

Extras além dos documentos: `GET /api/auth/me`, `GET /api/comunicados`, `PUT /api/admin/usuarios/:id/situacao`,
`GET|POST /api/admin/jurados/:id/atribuicoes` com remoção, `POST /api/admin/atribuicoes/distribuir`,
`PUT /api/admin/projetos/:id`, `GET /api/health`, `DELETE /api/perfil` (exclusão de conta, que o doc 01
§6 pede para prever), campo `User.telefone` (contato do perfil) e `User.sessoesValidasApos`.

A Home usa os dados da edição vigente, como o doc 02 prevê para `/api/hackathon/atual`: status, duração,
tamanho de equipe, equipes inscritas, desafios publicados, vencedores após a publicação e uma FAQ com as
regras configuradas (`src/server/home/dados.ts`). A consulta roda por requisição (`connection()`), nunca
no build, e sem banco a Home volta aos textos padrão.

Retenção de dados: `Hackathon.retencaoDadosDias` + descarte manual em `/admin/operacao`.

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
   - opcional: `APP_URL` (só compõe o link de redefinição de senha exibido no console em desenvolvimento)
   - opcionais de rate limit: `LOGIN_MAX_TENTATIVAS_POR_IP`, `LOGIN_JANELA_MINUTOS`, `RECUPERAR_SENHA_MAX_POR_IP`
3. Deploy. As migrations rodam no pre-deploy; `/api/health` responde 200 quando o banco está acessível.
4. Crie o primeiro admin (o seed é bloqueado em produção). Localmente, com a URL **pública** do Postgres:

   ```bash
   DATABASE_URL="<DATABASE_PUBLIC_URL da Railway>" ADMIN_EMAIL=... ADMIN_SENHA=... ADMIN_NOME="..." npm run admin:create
   ```

Validado contra PostgreSQL real (build de produção + `next start` + `test:fluxo` completo). O mesmo roda no CI.

Buscas por texto usam `contem()` de `src/lib/db.ts`, que ignora maiúsculas nos dois bancos.