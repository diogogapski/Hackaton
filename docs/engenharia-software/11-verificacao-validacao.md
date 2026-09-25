# Verificação e validação

## Verificação: estamos construindo corretamente?

A verificação é observada por lint, testes unitários, migrations, build, testes de fluxo e CI. Critérios de aceitação existem nas Issues PB01–PB35 e podem orientar inspeção das funcionalidades. A CI verifica a aplicação em SQLite e PostgreSQL; `scripts/teste-fluxo.mjs` verifica a integração de fluxos relevantes, inclusive permissões e mecanismos de segurança.

O uso de branches e Pull Requests no GitHub apoia a integração e a revisão das alterações antes da incorporação ao repositório principal.

## Validação: estamos construindo o produto correto?

A validação do produto considera o alinhamento entre o problema do hackathon, os fluxos implementados e as necessidades da comissão organizadora, participantes, jurados e visitantes. As páginas públicas e os fluxos administrativos apoiam a homologação da edição configurada.
