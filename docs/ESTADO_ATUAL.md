# Estado atual do projeto HACKIF

Retrato do que está pronto e do que falta, para quem for continuar. Conferido contra
`00_PLANO_GERAL_BACKEND.md`, `01_BACKEND_DEV1_IDENTIDADE_EQUIPES.md`, `02_BACKEND_DEV2_HACKATHON_AVALIACAO.md`,
o *Planejamento inicial de páginas* (31 telas) e o *Canvas do problema / Mapa de stakeholders*.

## Como rodar

```bash
npm install
cp .env.example .env          # troque AUTH_SECRET
npm run db:migrate            # aplica as migrations (obrigatório se já existia um prisma/dev.db)
npm run db:seed               # dados de exemplo
npm run dev                   # http://localhost:3000
```

Contas do seed (senha `Senha@123`): `admin@hackif.dev` (use `/login/servidor`), `jurado@hackif.dev`
(SIAPE `7654321`), `aluno@hackif.dev` (matrícula `20260001`, líder da "Equipe Exemplo", convite `HACKIF01`).

Site vazio (sem nenhuma edição cadastrada)? O admin mostra um guia para criar a primeira. Para preencher
tudo de uma vez com conteúdo de exemplo — edição, critérios, desafios, agenda e comunicados, todos
editáveis no admin depois:

```bash
BASE=https://seu-site ADMIN_EMAIL=... ADMIN_SENHA=... npm run conteudo:exemplo
```

Testes:

```bash
npm test                      # unitários (ranking, CSRF, texto de mudança de agenda, CSV) — 25 testes
npm run build && npm start    # em outro terminal, com banco vazio + admin criado:
ADMIN_EMAIL=... ADMIN_SENHA=... npm run test:fluxo   # API ponta a ponta (~220 verificações)
```

## Regras para quem continuar

- **Front existente não deve ser alterado.** Home, `/sobre`, Header, Footer e seções estão idênticos ao
  commit `e70fa69`; as demais telas existentes também foram mantidas. Pode-se **criar arquivos novos** no
  mesmo estilo visual.
- Dev 2 consome só `requireAuth`, `requireRole`, `getCurrentUser`, `getCurrentUserTeam`. Jurado é `User`
  com papel `JURADO` (não existe outra tabela).
- Toda regra de negócio configurável fica no banco (`Hackathon`, `Criterio`), nunca no código.
- Mudou `prisma/schema.prisma`? Gere a migration SQLite e rode `npm run db:pg:sync -- nome` para a do
  PostgreSQL; o `prebuild` falha se as duas estiverem dessincronizadas.
  Em terminal não interativo, `migrate dev` não roda: use
  `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script -o arquivo.sql`
  e copie para uma nova pasta em `prisma/migrations/`.

## O que está pronto

### Back-end — Dev 1 (identidade e equipes)
- Cadastro por vínculo (aluno, servidor, egresso/externo) com aceite dos termos; CPF opcional.
- Login por matrícula, SIAPE, CPF ou e-mail; JWT em cookie httpOnly; limite de tentativas por IP.
- Recuperação e redefinição de senha (token com hash, 1 h, uso único e atômico; sem envio de e-mail).
- Perfil com documentos bloqueados, troca de senha que derruba outras sessões e exclusão de conta (LGPD).
- Equipes: criar, entrar por código, convite, remover, sair, transferir liderança; 3–5 integrantes
  configuráveis; nunca sem líder.
- **Lista de espera**: com `Hackathon.limiteEquipes` definido, equipes completas além do limite ficam
  `LISTA_ESPERA` (ordem por `Team.completaEm`) e são promovidas sozinhas quando abre vaga (equipe
  desclassificada, desfeita, abaixo do mínimo ou limite aumentado). Equipe em espera não envia projeto.
- Admin de usuários (filtros, papel, bloqueio) e de equipes (correções, desclassificação).

### Back-end — Dev 2 (edição, projetos e avaliação)
- Edições com datas, local, período de inscrição, status, limites, escala de notas, regulamento e
  visibilidade pública (notas e lista de equipes, desligados por padrão).
- Desafios, agenda (com cancelamento) e comunicados.
- **Comunicado automático de mudança de agenda**: alterar horário, local, nome, cancelar ou remover uma
  atividade publica um comunicado (`origem: "AGENDA"`) com antes e depois, se
  `comunicarMudancasAgenda` estiver ligado e a edição não for rascunho.
- Submissão de projeto com prazo, desafio publicado, tecnologias, links e arquivos (Json).
- Jurados, atribuição manual e distribuição automática por `juradosPorProjeto`.
- **Convite de jurado externo**: `POST /api/admin/jurados/convidar` cria a conta JURADO e devolve um link
  para definir senha (válido 7 dias) — a comissão envia pelo canal que preferir.
- Avaliação por critério, reenvio configurável e trilha de auditoria (`RegistroAvaliacao`).
- **Correção de nota pela comissão**: `POST /api/admin/avaliacoes/corrigir`, antes da publicação, com
  justificativa obrigatória; aparece no histórico do projeto como `CORRECAO_COMISSAO`.
- Ranking por média ponderada com desempate configurável; publicação manual; dashboard.

### Operação (Canvas do problema)
- **Presença**: `GET|POST /api/admin/presencas` — marca/desmarca presença de membros das equipes.
- **Relatório consolidado**: `GET /api/admin/relatorio` (inscritos, presentes, taxa, vínculo, curso,
  equipes, projetos, avaliação, comunicação, pódio) e CSV em `GET /api/admin/relatorio/{participantes|equipes|resultado}`
  (`;`, BOM, proteção contra injeção de fórmula).
- **Descarte LGPD**: `Hackathon.retencaoDadosDias`; `GET /api/admin/lgpd/descarte` mostra a prévia e
  `POST` com `{ confirmar: true }` anonimiza contas cujas edições já passaram do prazo (nunca admins).

### Telas
- As 31 rotas do planejamento existem (`/hackathon`, `/desafios`, `/agenda`, `/resultados`, logins,
  cadastros, `/dashboard`, `/perfil`, `/equipe*`, `/projeto`, `/jurado*`, 12 telas `/admin/*`), além de
  `/privacidade`, `/regulamento`, `/redefinir-senha`. Rotas antigas redirecionam.
- Telas de operação, no menu admin (`src/components/layout/navegacao.ts`):
  `/admin/operacao` (limite de equipes, comunicação da agenda, retenção, convite de jurado, correção de
  nota, descarte LGPD), `/admin/presenca` e `/admin/relatorio`.

### Responsividade
- Todas as telas do sistema funcionam de 320px a desktop, sem rolagem horizontal.
- `Table` (`src/components/ui/Table.tsx` + `tabela.css`): abaixo de 640px cada linha vira um cartão com o
  nome da coluna ao lado do valor; colunas sem título (ações) ocupam a largura toda.
- `Panel` e `Stat` com `min-w-0`; botões quebram linha no celular; grades de números empilham.
- Exceção conhecida: o título grande de `/sobre` (front original do `e70fa69`) passa 37px em telas de 320px.

### Infraestrutura
- Prisma 7: SQLite em dev, PostgreSQL em produção (`prisma.config.ts` escolhe pela `DATABASE_URL`).
- Railway: `railway.json` (migrations no pre-deploy, healthcheck `/api/health`); `npm run admin:create`.
- CI (GitHub Actions): job SQLite e job PostgreSQL 16, ambos com build e `test:fluxo`.

### Última verificação
| Verificação | Resultado |
|---|---|
| Lint, testes unitários (25) | ok |
| Build de produção | ok |
| `test:fluxo` em SQLite (build de produção, banco vazio) | 216/216 |
| CI GitHub Actions (SQLite + PostgreSQL 16) | verde |
| Navegador: telas de operação — desktop e celular (375px) | 9/9 e 9/9 |
| Navegador: 31 páginas do planejamento | 40/40 |
| Varredura de overflow em 320, 375 e 768px (41 rotas, 3 papéis) | 0 problemas (exceto `/sobre` em 320px) |
| Front do commit `e70fa69` | idêntico |

## O que falta

### Próximos passos técnicos
1. Na Railway: serviço PostgreSQL + variáveis `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`,
   `ADMIN_EMAIL`, `ADMIN_SENHA`, `ADMIN_NOME` (o admin é criado no pre-deploy) e, recomendado, `AUTH_SECRET`
   e `APP_URL`. Detalhes em `docs/BACKEND.md` → Deploy na Railway.

### Front (Dev Front)
- Home: integrar dados reais da edição (datas, local, cronograma, desafios, vencedores).
- Âncoras da Home sem seção (`#faq`, `#agenda`, `#sobre` no rodapé); imagens e vídeos 3D.
