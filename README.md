# HACKIF

Front-end do HACKIF, sistema web do 1º Hackathon do curso de Ciência da Computação do IFPR Campus Pinhais.

O projeto está em desenvolvimento e atualmente concentra a construção da interface inicial da Home, com uma estética tecnológica inspirada em sistemas digitais, grids, HUDs técnicos e na identidade visual do Instituto Federal.

## O que já existe

- Header com marca HACKIF, navegação, CTA e menu.
- Hero principal com chamada do evento, CTAs, status e painel técnico.
- Área central preparada para receber o futuro visual 3D do IF.
- Barra de estatísticas do hackathon.
- Seção conceitual com o fluxo da ideia até a solução real e um bloco sobre o HACKIF.

## Tecnologias

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- lucide-react
- framer-motion
- next/font/google

## Como rodar

Entre na pasta do front-end:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Rode o projeto:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Back-end

API em `src/app/api` com Prisma + SQLite. Primeira execução:

```bash
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Detalhes, contrato entre os blocos e endpoints em [docs/BACKEND.md](docs/BACKEND.md).

## Documentação

A documentação técnica e visual do projeto está em:

[docs/FRONTEND.md](docs/FRONTEND.md)
