# Requisitos

Os requisitos abaixo foram derivados das Issues PB e da implementação. A referência entre parênteses aponta o backlog principal.

## Requisitos funcionais

| ID | Requisito verificável | PB |
|---|---|---|
| RF01 | O sistema deve cadastrar pessoas como aluno, servidor, egresso ou externo. | PB01 |
| RF02 | O sistema deve autenticar por e-mail, matrícula, SIAPE ou CPF e criar sessão. | PB02 |
| RF03 | O sistema deve permitir logout, recuperação e redefinição de senha. | PB03–PB04 |
| RF04 | O sistema deve permitir consultar e alterar dados permitidos do perfil. | PB05 |
| RF05 | O sistema deve permitir à administração listar usuários, alterar papel e bloquear acesso. | PB06 |
| RF06 | O sistema deve permitir criar, consultar e administrar equipes por convite. | PB07–PB09 |
| RF07 | O sistema deve permitir configurar e consultar uma edição do hackathon. | PB10–PB11 |
| RF08 | O sistema deve permitir administrar e publicar desafios, agenda e comunicados. | PB12–PB15 |
| RF09 | O sistema deve permitir à equipe cadastrar, editar e enviar um projeto. | PB16–PB17 |
| RF10 | O sistema deve permitir gerir jurados, atribuir projetos e avaliar por critérios. | PB18–PB21 |
| RF11 | O sistema deve calcular ranking e controlar a publicação de resultados. | PB22–PB24 |
| RF12 | O sistema deve disponibilizar dashboard, presença e relatórios administrativos. | PB25–PB27 |
| RF13 | O sistema deve permitir ao titular solicitar exclusão por anonimização e à administração executar descarte elegível. | PB30–PB31 |

## Requisitos não funcionais

| ID | Requisito verificável | Evidência |
|---|---|---|
| RNF01 | O sistema deve validar dados de entrada e responder erros em JSON padronizado. | `src/lib/http.ts`, Zod |
| RNF02 | O sistema deve suportar SQLite no desenvolvimento e PostgreSQL na produção. | schemas Prisma e CI |
| RNF03 | O sistema deve executar lint, testes, migrations e build na integração contínua. | `.github/workflows/ci.yml` |
| RNF04 | O sistema deve fornecer healthcheck que retorne 503 quando banco ou tabelas essenciais não estiverem acessíveis. | `src/app/api/health/route.ts` |
| RNF05 | O sistema deve apresentar interface pública e telas autenticadas responsivas. | páginas e commits de responsividade |

## Regras de negócio

| ID | Regra verificável | PB |
|---|---|---|
| RN01 | Uma equipe deve respeitar os limites mínimo e máximo configurados pela edição. | PB09 |
| RN02 | Um projeto deve estar associado a uma equipe e pode ser enviado conforme status e prazo da edição. | PB16–PB17 |
| RN03 | Uma avaliação é única por projeto, jurado e critério. | PB20 |
| RN04 | O ranking deve usar médias, pesos e desempates configurados. | PB21–PB22 |
| RN05 | Resultados só devem ser expostos quando publicados. | PB23 |
| RN06 | O descarte administrativo exige edição encerrada, prazo vencido e confirmação explícita. | PB31 |

## Restrições

- O sistema não deve gravar senha em texto puro; o campo persistido é `senhaHash`.
- O sistema não deve autorizar rotas administrativas sem papel `ADMIN`.
- O sistema não deve aceitar requisições mutáveis de origem externa quando o cabeçalho `Origin` estiver presente.
- O sistema não deve reativar uma conta já anonimizada.
