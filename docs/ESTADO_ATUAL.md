# Estado atual do projeto HACKIF

Retrato do que está pronto e do que falta, conferido contra `00_PLANO_GERAL_BACKEND.md`,
`01_BACKEND_DEV1_IDENTIDADE_EQUIPES.md`, `02_BACKEND_DEV2_HACKATHON_AVALIACAO.md`, o
*Planejamento inicial de páginas* (31 telas) e o *Canvas do problema / Mapa de stakeholders*.

## Como rodar

```bash
npm install
cp .env.example .env          # troque AUTH_SECRET
npm run db:migrate            # aplica as migrations (inclui as mais recentes)
npm run db:seed               # dados de exemplo
npm run dev                   # http://localhost:3000
```

Contas do seed (senha `Senha@123`): `admin@hackif.dev` (use `/login/servidor`), `jurado@hackif.dev`
(SIAPE `7654321`), `aluno@hackif.dev` (matrícula `20260001`, líder da "Equipe Exemplo", convite `HACKIF01`).

Quem já tinha um `prisma/dev.db` antigo precisa rodar `npm run db:migrate` antes do `npm run dev`.

## O que está pronto

### Front original (Dev Front)
- Home (`/`), `/sobre`, Header, Footer e seções: **inalterados em relação ao commit `e70fa69`**.

### Back-end — Dev 1 (identidade e equipes)
- Cadastro por vínculo (aluno, servidor, egresso/externo) com aceite dos termos; CPF opcional.
- Login por matrícula, SIAPE, CPF ou e-mail; JWT em cookie httpOnly; limite de tentativas por IP.
- Recuperação e redefinição de senha (token com hash, 1 h, uso único e atômico; sem envio de e-mail).
- Perfil com documentos bloqueados, troca de senha que derruba outras sessões e exclusão de conta (LGPD).
- Equipes: criar, entrar por código, convite, remover, sair, transferir liderança; 3–5 integrantes
  configuráveis; nunca sem líder.
- Admin de usuários (filtros, papel, bloqueio) e de equipes (correções, desclassificação).
- Helpers compartilhados: `requireAuth`, `requireRole`, `getCurrentUser`, `getCurrentUserTeam`.

### Back-end — Dev 2 (edição, projetos e avaliação)
- Edições com datas, local, período de inscrição, status, limites, escala de notas, regulamento e o que
  aparece publicamente (notas e lista de equipes, desligados por padrão).
- Desafios (publicar/despublicar), agenda (com cancelamento visível), comunicados.
- Submissão de projeto com prazo, desafio publicado, tecnologias, links e arquivos (Json).
- Jurados (papel JURADO), atribuição manual e distribuição automática por `juradosPorProjeto`.
- Avaliação por critério com validação da escala, reenvio configurável e **trilha de auditoria**
  (`RegistroAvaliacao`: quem lançou/alterou, quando, valor anterior e novo).
- Ranking por média ponderada com desempate por critério prioritário e ordem de envio; publicação manual.
- Dashboard administrativo.

### Telas do sistema (planejamento de páginas)
Todas as 31 rotas existem, no estilo visual do projeto: `/hackathon`, `/desafios`, `/agenda`, `/resultados`,
`/login` (+ `/login/aluno|servidor|externo`), `/cadastro/aluno|servidor|externo`, `/recuperar-senha`,
`/dashboard`, `/perfil`, `/equipe`, `/equipe/criar`, `/equipe/gerenciar`, `/projeto`, `/jurado`,
`/jurado/avaliacao/:id` e as 12 telas `/admin/*`. Extras: `/privacidade`, `/regulamento`, `/redefinir-senha`.
Rotas antigas (`/entrar`, `/conta`, `/participante/*`, `/admin/edicoes`) redirecionam.

Nas páginas novas há uma barra de navegação do sistema abaixo do Header original (Entrar, Criar conta,
Desafios, Agenda…). A Home não recebe essa barra.

### Infraestrutura e qualidade
- Prisma 7: SQLite em desenvolvimento, PostgreSQL em produção (schema e migrations gerados por
  `npm run db:pg:sync`; o build falha se estiverem desatualizados).
- Railway: `railway.json` com migrations no pre-deploy e healthcheck `/api/health`; `npm run admin:create`
  cria o primeiro administrador.
- Segurança: checagem de origem contra CSRF, sessões invalidadas após troca/redefinição de senha,
  respostas sem hash ou senha.
- Testes: `npm test` (ranking e CSRF, 13 testes) e `npm run test:fluxo` (API ponta a ponta, ~180 verificações).
- CI (GitHub Actions): job SQLite e job PostgreSQL 16 real, ambos com build e `test:fluxo`.

### Última verificação
| Verificação | Resultado |
|---|---|
| Lint, tipos, testes unitários, build | ok |
| `test:fluxo` em SQLite | 181/181 |
| `test:fluxo` em PostgreSQL real (build de produção) | 174/174 (sem as etapas que leem o log do servidor) |
| Navegador: as 31 páginas do planejamento, com cada papel | 40/40 passos, sem erros no console |
| Front do commit `e70fa69` | idêntico |

## O que falta

### Depende de decisão da comissão (perguntas em aberto nos documentos)
- Prazo de retenção/expurgo de dados pessoais (hoje só existe exclusão a pedido do titular).
- Validação externa de matrícula e SIAPE.
- Se a coordenação do curso terá acesso próprio (hoje só existem PARTICIPANTE, JURADO e ADMIN).
- Lista de espera acima de 25 equipes; mais de uma rodada de avaliação (triagem e final).
- Canal de notificação além do painel (e-mail não é enviado).
- Registro de presença (a coordenação pede número de presentes).
- Dados extras de participante (restrição alimentar, camiseta) e limite de tamanho de arquivos
  (hoje arquivos são links).
- Quem na comissão pode alterar nota já lançada (hoje só o próprio jurado, quando permitido; tudo fica registrado).

### Front
- Home: integrar dados reais da edição (datas, local, cronograma resumido, desafios, vencedores) e acesso ao
  login, como pede o planejamento — decisão do Dev Front, pois a Home foi mantida como está.
- Âncoras da Home sem seção: `#faq`, `#agenda` (e `#sobre` no rodapé).
- Imagens e vídeos 3D da Home.

### Documentação
- `docs/BACKEND.md` ainda descreve as rotas de tela antigas (`/entrar`, `/conta`, `/participante/*`,
  `/admin/edicoes`) e não menciona agenda cancelada, equipes públicas nem a trilha de auditoria. Os `.md`
  existentes não foram alterados nesta etapa, por pedido.

### Publicação
- Commits locais ainda não enviados: `git push origin main`.
- Na Railway: serviço PostgreSQL + variáveis `DATABASE_URL` (também no build) e `AUTH_SECRET`; depois,
  `npm run admin:create` com a URL pública do banco.
