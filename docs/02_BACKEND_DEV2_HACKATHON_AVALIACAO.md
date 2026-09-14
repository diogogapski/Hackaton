# Back-end — Dev 2
## Hackathon, Desafios, Agenda, Projetos, Avaliação e Resultados

Sistema de Apoio ao Hackathon — IFPR Campus Pinhais

Este documento cobre TODO o back-end + DB relacionado ao "conteúdo da edição": páginas 2–5, 17–22, 25–31 do planejamento original.

Depende do Bloco A (Dev 1) apenas para: `requireAuth`, `requireRole`, e saber o `user_id`/`team_id` do usuário logado. Combine com o Dev 1 a assinatura dessas funções antes de começar.

---

## 1. Modelagem de dados (sua responsabilidade)

### `Hackathon` (edição)
| Campo | Tipo |
|---|---|
| id | uuid |
| nome | string |
| descricao | text |
| data_inicio / data_fim | datetime |
| periodo_inscricao_inicio / fim | datetime |
| status | enum(RASCUNHO, INSCRICOES_ABERTAS, EM_ANDAMENTO, ENCERRADO) |
| limite_min_integrantes / limite_max_integrantes | int, default 3 / 5 |
| regulamento_url ou regulamento_texto | text |

### `Desafio` (proposta)
| Campo | Tipo |
|---|---|
| id | uuid |
| hackathon_id | FK |
| titulo | string |
| descricao | text |
| categoria | string |
| responsavel | string |
| publicado | boolean |

### `AgendaItem`
| Campo | Tipo |
|---|---|
| id | uuid |
| hackathon_id | FK |
| titulo/atividade | string |
| horario_inicio / horario_fim | datetime |
| local | string |
| observacoes | text, nullable |

### `Projeto`
| Campo | Tipo |
|---|---|
| id | uuid |
| team_id | FK -> Team (do Bloco A, só referência) |
| hackathon_id | FK |
| desafio_id | FK, nullable |
| nome | string |
| descricao | text |
| solucao | text |
| tecnologias | string[] ou text |
| links | string[] (repositório, vídeo, deploy...) |
| arquivos | referência a upload, se houver (pode ser só URL no MVP) |
| enviado_em | datetime |

### `Criterio`
| Campo | Tipo |
|---|---|
| id | uuid |
| hackathon_id | FK |
| nome | string |
| peso | float |
| nota_min / nota_max | float |

### `AvaliacaoAtribuicao` (qual jurado avalia qual projeto)
| Campo | Tipo |
|---|---|
| id | uuid |
| jurado_id | FK -> User |
| projeto_id | FK |
| concluida | boolean |

### `Avaliacao` (notas)
| Campo | Tipo |
|---|---|
| id | uuid |
| projeto_id | FK |
| jurado_id | FK |
| criterio_id | FK |
| nota | float |
| comentario | text, nullable |
| avaliado_em | datetime |

### `Comunicado`
| Campo | Tipo |
|---|---|
| id | uuid |
| hackathon_id | FK |
| titulo | string |
| conteudo | text |
| publicado_em | datetime |

---

## 2. Endpoints — Área pública
*(Páginas 2, 3, 4, 5)*

- [ ] `GET /api/hackathon/atual` — dados da edição vigente (para Home e `/hackathon`)
- [ ] `GET /api/desafios` — só os `publicado = true`
- [ ] `GET /api/agenda` — ordenada por horário
- [ ] `GET /api/resultados` — só depois de `resultados_publicados = true` no Hackathon; retorna ranking, equipes, projetos e (se autorizado) notas

---

## 3. Endpoints — Submissão de Projeto
*(Página 17)*

- [ ] `GET /api/projeto` — projeto da equipe do usuário logado
- [ ] `POST /api/projeto` — criar/submeter
- [ ] `PUT /api/projeto` — editar (definir até quando é permitido editar — sugestão: até `data_fim` do hackathon ou até status virar `EM_ANDAMENTO`/`ENCERRADO`)
- [ ] Validar que só quem pertence à equipe (via `team_id` do usuário logado, checado com o Dev 1) pode editar o projeto daquela equipe

---

## 4. Endpoints — Jurado
*(Páginas 18, 19)*

- [ ] `GET /api/jurado/projetos` — lista de projetos atribuídos ao jurado logado, com status pendente/concluída
- [ ] `GET /api/jurado/avaliacao/:projetoId` — dados do projeto + equipe + lista de critérios para avaliar
- [ ] `POST /api/jurado/avaliacao/:projetoId` — envia notas por critério + comentário; marca `AvaliacaoAtribuicao.concluida = true`
- [ ] Validar que a nota respeita `nota_min`/`nota_max` do critério
- [ ] Impedir reenvio duplicado (ou permitir edição até prazo — definir com o time)

---

## 5. Endpoints — Admin
*(Páginas 20, 21, 22, 25, 26, 27, 28, 29, 30, 31)*

**Hackathons**
- [ ] `GET/POST /api/admin/hackathons`
- [ ] `PUT /api/admin/hackathons/:id`

**Desafios**
- [ ] `GET/POST /api/admin/desafios`
- [ ] `PUT/DELETE /api/admin/desafios/:id` (publicar/despublicar)

**Agenda**
- [ ] `GET/POST /api/admin/agenda`
- [ ] `PUT/DELETE /api/admin/agenda/:id`

**Projetos**
- [ ] `GET /api/admin/projetos` — listar todos, com situação

**Jurados**
- [ ] `GET/POST /api/admin/jurados` — autorizar usuário como JURADO (via papel, ver Dev 1)
- [ ] `POST /api/admin/jurados/:id/atribuicoes` — atribuir projetos a um jurado (manual ou distribuição automática — combine a regra com a comissão; comece manual)

**Critérios**
- [ ] `GET/POST/PUT/DELETE /api/admin/criterios` — nunca hardcode critérios no código, sempre configurável

**Avaliações**
- [ ] `GET /api/admin/avaliacoes` — acompanhar pendentes/concluídas por jurado e por projeto

**Resultados**
- [ ] `GET /api/admin/resultados` — cálculo do ranking (soma/média ponderada pelos pesos dos critérios)
- [ ] Lógica de desempate (definir critério: nota mais alta em critério X, ordem de submissão, etc. — deixar configurável ou documentado)
- [ ] `POST /api/admin/resultados/publicar` — seta `resultados_publicados = true` no Hackathon (só então `/api/resultados` público retorna dados)

**Comunicados**
- [ ] `GET/POST /api/admin/comunicados`
- [ ] `PUT/DELETE /api/admin/comunicados/:id`

**Dashboard admin** (página 20 — agregador, feito por último)
- [ ] `GET /api/admin/dashboard` — contadores: inscrições, equipes, participantes, projetos, jurados, avaliações pendentes, próximos itens de agenda (combina dados do seu bloco; se precisar de contagem de usuários/equipes, chame os endpoints do Dev 1 ou combine query compartilhada)

---

## 6. Regras de negócio a documentar/configurar (não hardcode)

- Cálculo de nota final: `soma(nota_criterio * peso_criterio) / soma(pesos)` — implementar como função isolada e testável
- Quantidade de jurados por projeto: variável de configuração no `Hackathon`, não fixa no código
- Publicação de resultados: sempre manual (flag), nunca automática ao fim do prazo

---

## 7. Checklist de entrega

- [ ] Schema `Hackathon`, `Desafio`, `AgendaItem`, `Projeto`, `Criterio`, `AvaliacaoAtribuicao`, `Avaliacao`, `Comunicado` migrado
- [ ] Endpoints públicos (home/desafios/agenda/resultados) funcionando sem autenticação
- [ ] Fluxo completo de submissão de projeto testado ponta a ponta
- [ ] Fluxo completo de avaliação (atribuição → jurado avalia → admin apura → publica) testado ponta a ponta
- [ ] Função de cálculo de ranking com testes unitários simples (casos com empate incluídos)
- [ ] Seed com 1 hackathon, 2 desafios, 1 projeto e 1 critério para o Front testar
