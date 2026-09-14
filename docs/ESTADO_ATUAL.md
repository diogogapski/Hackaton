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
- Telas novas de operação, **ainda sem link no menu admin** (acessar pela URL):
  `/admin/operacao` (limite de equipes, comunicação da agenda, retenção, convite de jurado, correção de
  nota, descarte LGPD), `/admin/presenca` e `/admin/relatorio`.

### Infraestrutura
- Prisma 7: SQLite em dev, PostgreSQL em produção (`prisma.config.ts` escolhe pela `DATABASE_URL`).
- Railway: `railway.json` (migrations no pre-deploy, healthcheck `/api/health`); `npm run admin:create`.
- CI (GitHub Actions): job SQLite e job PostgreSQL 16, ambos com build e `test:fluxo`.

### Última verificação
| Verificação | Resultado |
|---|---|
| Lint, testes unitários (25) | ok |
| `test:fluxo` em SQLite | 223/223 |
| `test:fluxo` em PostgreSQL embutido (Windows) | 213/216 — as 3 falhas eram o caractere "→" no texto do comunicado, que o banco de teste em WIN1252 não aceitava; trocado por "->". Reexecutar no CI (Postgres UTF8) |
| Navegador: telas de operação | 9/9 |
| Navegador: 31 páginas do planejamento | 40/40 |
| Front do commit `e70fa69` | idêntico |

## O que falta

### Próximos passos técnicos
1. Confirmar o job PostgreSQL do CI verde após este commit.
2. Adicionar links para `/admin/operacao`, `/admin/presenca` e `/admin/relatorio` no menu admin
   (`src/components/layout/navegacao.ts` / `AdminShell`) — não foi feito para não alterar o front existente;
   combinar com o Dev Front.
3. Na Railway: PostgreSQL + variáveis `DATABASE_URL` (também no build), `AUTH_SECRET`, `APP_URL`
   (usada no link do convite de jurado); depois `npm run admin:create`.

### Depende de decisão da comissão
- Validação externa de matrícula e SIAPE.
- Acesso próprio para a coordenação do curso (hoje: PARTICIPANTE, JURADO, ADMIN).
- Mais de uma rodada de avaliação (triagem e final).
- Canal de notificação além do painel (e-mail não é enviado).
- Dados extras de participante (restrição alimentar, camiseta) e upload real de arquivos (hoje são links).
- Valor padrão de `retencaoDadosDias` e `limiteEquipes` (hoje nulos = sem descarte / sem limite).

### Front (Dev Front)
- Home: integrar dados reais da edição (datas, local, cronograma, desafios, vencedores).
- Âncoras da Home sem seção (`#faq`, `#agenda`, `#sobre` no rodapé); imagens e vídeos 3D.
