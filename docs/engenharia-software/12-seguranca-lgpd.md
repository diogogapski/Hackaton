# Segurança e LGPD

## Mecanismos implementados

- Senhas são processadas por `bcryptjs`; o banco persiste `senhaHash`.
- A sessão é JWT HS256, com expiração de sete dias, cookie `httpOnly`, `sameSite=lax` e `secure` em produção (`src/lib/auth/session.ts`).
- `requireAuth` e `requireRole` restringem rotas protegidas por usuário e papel.
- Sessões anteriores são invalidadas após troca de senha ou anonimização por `sessoesValidasApos`.
- Tokens de recuperação/verificação são persistidos como hash e possuem expiração e uso único.
- `src/lib/http.ts` bloqueia requisições mutáveis de origem externa quando `Origin` é informado e limita o corpo JSON a 64 KiB.
- O proxy aplica Content Security Policy com nonce, `frame-ancestors 'none'` e outras diretivas.
- Rate limiting é persistido em `TentativaAcesso`, por IP e por chave SHA-256 do identificador de login, com limpeza de registros antigos.

## Privacidade

O modelo contém dados pessoais como nome, e-mail, identificadores, curso e telefone; CPF é opcional e comentado como sensível. O registro grava o momento de aceite de termos. A exclusão solicitada pelo titular exige senha, remove ou substitui dados pessoais, encerra a sessão e mantém apenas o histórico necessário de equipes.

O descarte administrativo exige status encerrado, prazo de retenção configurado e vencido, elegibilidade entre edições relacionadas e confirmação explícita. Administradores não são incluídos no descarte automático.

O sistema implementa mecanismos relacionados à proteção de dados e aos requisitos de privacidade definidos para o projeto. Esses mecanismos abrangem autenticação, autorização, proteção contra requisições indevidas, controle de tentativas e anonimização de dados pessoais.
