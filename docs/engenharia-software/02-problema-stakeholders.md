# Problema e stakeholders

## Problema e cenário atual (AS-IS)

O material de planejamento aponta a necessidade de centralizar a operação de um hackathon: cadastro de pessoas com vínculos distintos, formação de equipes, regras de inscrição, divulgação de desafios e agenda, submissão, avaliação e divulgação de resultados. Sem uma aplicação integrada, essas informações e controles dependem de processos dispersos, dificultando a organização e a prestação de contas.

## Impactos tratados

- Dificuldade em acompanhar equipes, vagas e situação das inscrições.
- Falta de um ponto único para agenda, comunicados e desafios publicados.
- Necessidade de controlar atribuições, notas, ranking e publicação dos resultados.
- Necessidade de proteger dados pessoais e possibilitar anonimização/descarte.

## Stakeholders identificados

| Stakeholder | Interesse ou interação evidenciada |
|---|---|
| Comissão organizadora | Configura edições, administra usuários, equipes, agenda, critérios, avaliações, resultados e operação. |
| Participantes | Cadastram-se, formam equipe, mantêm perfil, submetem projeto e consultam informações. |
| Jurados | Recebem projetos atribuídos e registram avaliações por critérios. |
| Visitantes | Consultam informações públicas, desafios, agenda e resultados publicados. |
| IFPR Campus Pinhais | Contexto institucional e local informado nas páginas e no planejamento. |

## Cenário desejado (TO-BE)

Uma aplicação web única deve permitir que a comissão configure uma edição e divulgue conteúdo público, enquanto áreas protegidas aplicam permissões conforme papel. O sistema deve manter as informações operacionais relacionadas a equipes, projetos e avaliação, permitindo a publicação controlada de resultados.

## Sinais de sucesso e hipóteses

Sinais verificáveis incluem a execução dos fluxos de cadastro, equipe, projeto, avaliação e operação no teste `scripts/teste-fluxo.mjs`, e a disponibilidade dos dois ambientes de banco na CI. A hipótese observada no planejamento é que critérios, pesos, limites e regras variem por edição; por isso esses dados são configuráveis no modelo `Hackathon` e em `Criterio`.

## Decisões configuráveis

Regras como limites de equipes, escala de notas, critérios de avaliação, quantidade de jurados, período de inscrição e retenção de dados são configuradas por edição. Essa organização permite adequar o sistema às regras definidas pela comissão organizadora para cada hackathon.
