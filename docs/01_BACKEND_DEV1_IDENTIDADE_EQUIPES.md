# Back-end — Dev 1
## Identidade, Autenticação, Perfis e Equipes

Sistema de Apoio ao Hackathon — IFPR Campus Pinhais

Este documento cobre TODO o back-end + DB relacionado a "quem é o usuário e a que equipe ele pertence": páginas 6–11, 13–16, 23–24 e a seção 6 do planejamento original.

---

## 1. Modelagem de dados (sua responsabilidade)

### `User`
| Campo | Tipo | Observação |
|---|---|---|
| id | uuid/PK | |
| nome | string | |
| email | string, único | |
| senha_hash | string | bcrypt/argon2, nunca salvar em texto puro |
| vinculo | enum(ALUNO, SERVIDOR, EGRESSO, EXTERNO) | |
| matricula | string, nullable, único quando presente | só ALUNO |
| siape | string, nullable, único quando presente | só SERVIDOR |
| cpf | string, nullable | só EGRESSO/EXTERNO — **campo sensível, ver LGPD abaixo** |
| curso | string, nullable | só ALUNO |
| papel | enum(PARTICIPANTE, JURADO, ADMIN) | default PARTICIPANTE |
| termos_aceitos_em | datetime, nullable | data de aceite dos termos/privacidade |
| criado_em / atualizado_em | datetime | |

### `PasswordReset`
| Campo | Tipo |
|---|---|
| id | uuid |
| user_id | FK -> User |
| token_hash | string |
| expira_em | datetime |
| usado_em | datetime, nullable |

### `Team` (Equipe)
| Campo | Tipo |
|---|---|
| id | uuid |
| nome | string |
| hackathon_id | FK -> Hackathon (do Bloco B — só referência, não implementar Hackathon aqui) |
| lider_id | FK -> User, nullable |
| situacao | enum(EM_FORMACAO, INSCRITA, DESCLASSIFICADA...) — combinar nomes com Dev 2 |
| criado_em | datetime |

### `TeamMember`
| Campo | Tipo |
|---|---|
| id | uuid |
| team_id | FK -> Team |
| user_id | FK -> User |
| entrou_em | datetime |
| saiu_em | datetime, nullable |

> Regra de negócio: 3 a 5 integrantes ativos por equipe (validar no service, não só no front). Liderança é função associada à participação (não é papel global do `User`) — está correto modelar como campo em `Team`, não em `User`.

---

## 2. Endpoints — Autenticação e Cadastro
*(Páginas 6, 7, 8, 9, 10, 11)*

- [ ] `POST /api/auth/register/aluno` — nome, matrícula, e-mail, curso, senha
- [ ] `POST /api/auth/register/servidor` — nome, SIAPE, e-mail institucional, senha
- [ ] `POST /api/auth/register/externo` — nome, CPF (ver nota LGPD), e-mail, vínculo declarado, senha
- [ ] `POST /api/auth/login` — recebe `identificador` (matrícula/SIAPE/CPF ou e-mail) + `vinculo` + senha; retorna JWT em cookie httpOnly
- [ ] `POST /api/auth/logout`
- [ ] `POST /api/auth/recuperar-senha` — recebe e-mail, gera token, dispara e-mail (pode mockar envio de e-mail no MVP, logar no console)
- [ ] `POST /api/auth/redefinir-senha` — recebe token + nova senha
- [ ] Middleware `requireAuth` e `requireRole(['ADMIN'])` reutilizável por toda a aplicação (inclusive Bloco B)

**Regras de negócio importantes:**
- Rate limiting básico no login (evitar brute force) — pode ser simples (ex: 5 tentativas / 15 min por IP+usuário)
- Senha nunca retorna em nenhuma resposta de API
- Cadastro deve exigir aceite explícito dos termos (`termos_aceitos_em` obrigatório antes de liberar conta)
- Validar unicidade de matrícula/SIAPE/CPF/e-mail no banco (constraint, não só na aplicação)

---

## 3. Endpoints — Perfil
*(Página 13)*

- [ ] `GET /api/perfil` — dados do usuário logado
- [ ] `PUT /api/perfil` — editar nome, e-mail, contato
- [ ] `PUT /api/perfil/senha` — trocar senha (exige senha atual)
- [ ] Bloquear edição de `matricula`, `siape`, `cpf` via API depois de validados (regra do PDF, item 13) — no MVP pode travar sempre, sem depender de "validado"

---

## 4. Endpoints — Equipes
*(Páginas 14, 15, 16)*

- [ ] `GET /api/equipe` — equipe do usuário logado (integrantes, líder, situação)
- [ ] `POST /api/equipe` — criar equipe (usuário criador vira líder)
- [ ] `POST /api/equipe/convite` — gerar convite/código para entrar (definir mecanismo: código de convite é o mais simples para MVP)
- [ ] `POST /api/equipe/entrar` — entrar via código de convite (validar limite de 5 integrantes antes de aceitar)
- [ ] `DELETE /api/equipe/membro/:userId` — remover membro (só líder ou admin)
- [ ] `POST /api/equipe/sair` — usuário sai da própria equipe
- [ ] `POST /api/equipe/transferir-lideranca` — só líder atual pode transferir
- [ ] Validação: nunca deixar equipe sem líder enquanto houver membros (se líder sai, obrigar transferência antes ou promover automaticamente o mais antigo)

---

## 5. Endpoints — Admin (Usuários e Equipes)
*(Páginas 23, 24)*

- [ ] `GET /api/admin/usuarios` — listar/filtrar por vínculo, papel, situação; paginação e busca por nome/e-mail
- [ ] `PUT /api/admin/usuarios/:id/papel` — atribuir papel (ex: promover a JURADO ou ADMIN)
- [ ] `GET /api/admin/equipes` — listar equipes com integrantes, líder, situação e projeto vinculado (o campo "projeto" vem do Bloco B — aqui você só expõe o relacionamento, não implementa a lógica de projeto)
- [ ] `PUT /api/admin/equipes/:id` — editar/corrigir situação de equipe, resolver duplicidade/inconsistência manualmente

---

## 6. LGPD — pontos que você precisa tratar no schema/serviço (mesmo sem resposta final da comissão)

- CPF é campo sensível: se a comissão decidir que não é necessário, ele precisa poder ficar `null` sem quebrar nada — já modele como `nullable` desde o início.
- Prever endpoint futuro de exclusão/anonimização de conta (não precisa implementar agora, mas não modele nada que impeça isso depois, ex: evite deletar em cascata sem soft-delete).
- Log de aceite de termos (`termos_aceitos_em`) é sua responsabilidade e é o único requisito de LGPD que já está claro o suficiente para implementar agora.

---

## 7. Checklist de entrega

- [ ] Schema `User`, `PasswordReset`, `Team`, `TeamMember` migrado
- [ ] Middleware de auth/autorização pronto e documentado para o Dev 2 consumir
- [ ] Todos os endpoints de auth funcionando com Postman/Thunder Client + testes manuais
- [ ] Endpoints de equipe com as regras de 3–5 integrantes e liderança
- [ ] Endpoints admin de usuários/equipes
- [ ] Seed com usuários de teste (1 admin, 1 aluno, 1 externo) para o Dev 2 e o Front usarem
