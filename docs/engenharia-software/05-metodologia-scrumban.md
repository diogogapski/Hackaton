# Metodologia: Scrumban

## Interpretação histórica

Durante a Sprint 0, a equipe iniciou o trabalho de forma colaborativa e realizou a definição do problema, identificação dos stakeholders, levantamento inicial do escopo e planejamento técnico. O plano versionado registra três integrantes e a divisão principal em Front-end, Back-end 1 e Back-end 2.

Com a evolução do projeto, o processo de trabalho foi formalizado por uma abordagem Scrumban: ciclos de entrega inspirados em Scrum combinados à gestão visual do fluxo por Kanban. A equipe atua nas frentes de Front-end, Back-end 1 e Back-end 2.

## Elementos observados

| Aspecto | Aplicação documentada |
|---|---|
| Scrum | Product Backlog PB01–PB35, organização por Sprints, incrementos e revisão pelo histórico/PRs. |
| Kanban | GitHub Project com fluxo `Backlog → Ready → In Progress → Code Review → Testing → Done`. |
| WIP | Limite de três itens em `In Progress`, coerente com a equipe de três integrantes. |

O Product Backlog consolida as funcionalidades do projeto e organiza sua rastreabilidade com Issues, implementações e testes.

```mermaid
flowchart LR
  Backlog --> Ready
  Ready --> Progress[In Progress]
  Progress --> Review[Code Review]
  Review --> Testing
  Testing --> Done
```

## Ciclo de vida incremental

O ciclo de vida é compatível com evolução incremental: cada Sprint reúne funcionalidades que formam um incremento do sistema. Scrumban descreve a organização do trabalho; incremental descreve a forma de evolução e entrega do produto. Os commits mostram, por exemplo, incrementos de API/banco, fluxos operacionais, segurança e refinamento de interface.
