# Plano Geral — Back-end & Banco de Dados
## Sistema de Apoio ao Hackathon — IFPR Campus Pinhais
### Engenharia de Software I — Sprint 0

---

## 1. Contexto

Time de 3 pessoas:

| Papel | Responsável | Escopo |
|---|---|---|
| Front-end | Dev Front | Todas as 31 páginas do planejamento (área pública, auth, participante, jurado, admin) |
| Back-end + DB — Bloco A | Dev Back 1 | Identidade, autenticação, perfis, equipes e administração de usuários/equipes |
| Back-end + DB — Bloco B | Dev Back 2 | Edições do Hackathon, desafios, agenda, projetos, jurados/avaliação, resultados e comunicados |

O repositório atual (`Hackaton-main`) só contém o front (Next.js 16 + React 19 + Tailwind 4, sem back e sem banco). Este documento organiza o que falta construir no back+DB e divide entre os dois devs de back.

---

## 2. Stack sugerida (a validar em equipe)

Como o front já é Next.js, a opção de menor atrito é:

- **API**: Next.js API Routes (ou Route Handlers do App Router) dentro do mesmo repo — evita subir um segundo serviço.
- **ORM**: Prisma (migrations versionadas, schema único compartilhado pelos dois devs de back).
- **Banco**: PostgreSQL (local via Docker em dev; Railway/Supabase/Neon em produção — qualquer um free tier serve para o projeto acadêmico).
- **Autenticação**: JWT em cookie httpOnly + hash de senha com bcrypt/argon2.
- **Validação**: Zod nos endpoints (schemas compartilhados entre os dois blocos).

> Alternativa: back separado (Express/Fastify) se o time preferir desacoplar do Next. Isso muda só a infraestrutura, não a divisão de tarefas abaixo.

**Decisão a tomar em equipe antes de começar:** Next API Routes vs back separado; Prisma vs outro ORM. O resto do planejamento assume Next API Routes + Prisma, mas os módulos valem para qualquer stack.

---

## 3. Estrutura de dados compartilhada (schema único)

Os dois devs de back trabalham sobre o **mesmo `schema.prisma`** (ou migrations equivalentes). Setup inicial é tarefa conjunta:

- [ ] Configurar Postgres local (Docker Compose) + `.env` com `DATABASE_URL`
- [ ] Inicializar Prisma / ferramenta de migration escolhida
- [ ] Definir enums compartilhados: `Vinculo` (ALUNO, SERVIDOR, EGRESSO, EXTERNO), `Papel` (PARTICIPANTE, JURADO, ADMIN)
- [ ] Combinar convenção de nomes de tabelas/campos (snake_case ou camelCase) e de rotas (`/api/...`)
- [ ] Criar middleware de autenticação/autorização compartilhado (quem faz: **Dev Back 1**, quem consome: os dois)
- [ ] Seed script básico (1 hackathon fake, 1 admin, 1 aluno) para os dois testarem sem depender um do outro

Depois desse setup conjunto (idealmente 1 sessão juntos), cada um migra e evolui **suas próprias tabelas** de forma independente, evitando conflito de merge.

---

## 4. Divisão dos módulos (mapeado às páginas do PDF)

### Bloco A — Dev Back 1: Identidade, Perfis e Equipes
Detalhes completos em `01_BACKEND_DEV1_IDENTIDADE_EQUIPES.md`

Cobre as páginas: 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 23, 24 (+ seção 6 "Perfis, vínculos e permissões")

- Autenticação (aluno / servidor / externo) e cadastro
- Recuperação de senha
- Perfil do usuário
- Equipes: criar, gerenciar, entrar, sair, transferir liderança
- Admin: gerenciar usuários e gerenciar equipes

### Bloco B — Dev Back 2: Hackathon, Desafios, Projetos e Avaliação
Detalhes completos em `02_BACKEND_DEV2_HACKATHON_AVALIACAO.md`

Cobre as páginas: 2, 3, 4, 5, 17, 18, 19, 21, 22, 25, 26, 27, 28, 29, 30, 31 (+ dashboard admin agregador, página 20)

- Edições do Hackathon (CRUD admin)
- Desafios/propostas
- Agenda do evento
- Submissão de projeto
- Jurados: painel e avaliação
- Critérios de avaliação
- Apuração e publicação de resultados
- Comunicados
- Dashboard administrativo (agregação de dados dos dois blocos)

**Por que essa divisão:** Bloco A é auto-contido em torno de "quem é o usuário e a quem ele pertence" (identidade + equipe), enquanto Bloco B é auto-contido em torno de "o que acontece na edição do evento" (conteúdo, avaliação, resultado). Isso minimiza dependência cruzada — o Bloco B só depende do Bloco A para saber "quem está logado e a que equipe pertence", que fica isolado no middleware de auth combinado no setup inicial.

---

## 5. Pontos que dependem de decisão da comissão organizadora (não travam o início do dev)

Já estavam listados no PDF (seção 7) — ambos os devs devem modelar o schema já pensando que estas respostas podem mudar (evitar hardcode):

- Como matrícula/SIAPE serão validados (integração externa ou apenas cadastro manual?)
- CPF é realmente necessário para egressos/externos? (impacto direto em LGPD)
- Existe módulo de desafios/propostas ou não?
- Existe líder formal de equipe e quais suas permissões?
- Critérios, pesos e escala de avaliação — devem ficar 100% configuráveis via admin, nunca fixos em código
- Quantos jurados avaliam cada projeto (regra de distribuição automática ou manual?)
- Quando resultados podem ser publicados (flag manual de aprovação, como já previsto na página `/admin/resultados`)
- Tempo de retenção de dados pessoais (política de expurgo)

Sugestão: tratar esses pontos como **feature flags / configurações no admin**, não como regras fixas — isso já é mencionado no PDF para critérios (item 27) e vale para os outros.

---

## 6. Ordem sugerida de execução (Sprint 0 → Sprint 1)

1. Setup conjunto (seção 3) — 1 sessão em par
2. Dev Back 1: modelo de dados de usuário + endpoints de auth (bloqueante para login funcionar em qualquer tela)
3. Dev Back 2: modelo de dados de Hackathon/edição (bloqueante para tudo que referencia uma edição — desafios, agenda, projetos)
4. A partir daí, os dois avançam em paralelo nos próprios MDs
5. Integração: Bloco B consome `getUsuarioLogado()` / `getEquipeDoUsuario()` expostos pelo Bloco A

---

## 7. Arquivos deste planejamento

- `00_PLANO_GERAL_BACKEND.md` — este arquivo
- `01_BACKEND_DEV1_IDENTIDADE_EQUIPES.md` — tarefas detalhadas do Dev Back 1
- `02_BACKEND_DEV2_HACKATHON_AVALIACAO.md` — tarefas detalhadas do Dev Back 2
