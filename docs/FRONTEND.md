# Documentação do Front-end

Este documento descreve a organização atual do front-end do HACKIF, as decisões visuais já aplicadas e os principais componentes implementados.

## Identidade visual

A interface segue uma estética tecnológica, experimental e escura, inspirada em sistemas digitais, grids técnicos e na identidade visual do Instituto Federal.

Principais decisões visuais:

- fundo quase preto: `#050706`;
- verde-limão/neon como cor de destaque: `#B6FF00`;
- textos principais em off-white;
- textos secundários em cinza;
- vermelho usado apenas de forma pontual;
- linhas finas, labels técnicos, grids e detalhes visuais discretos.

## Fontes

As fontes estão configuradas em `src/app/layout.tsx` usando `next/font/google`.

Fontes disponíveis:

- Chakra Petch: marca, títulos e elementos visuais principais;
- Archivo: disponível para títulos;
- IBM Plex Sans: textos e interface;
- IBM Plex Mono: dados, status e informações técnicas.

## Estrutura de pastas

```text
src/
  app/
    layout.tsx, page.tsx, globals.css   Home e layout raiz
    sobre/                              página Sobre
    hackathon/ resultados/ regulamento/ páginas públicas ligadas à API
    cadastro/ entrar/ recuperar-senha/ redefinir-senha/
    conta/                              perfil e senha (qualquer papel)
    participante/ jurado/ admin/        áreas logadas (layout protege por papel)
    api/                                back-end (ver docs/BACKEND.md)
  components/
    layout/      Header, Footer, AppShell, AuthLayout, navegacao.ts
    sections/    Hero, Concept, home/ (inclui FaqSection) e about/ (Home e Sobre)
    ui/          app.tsx — componentes das telas logadas
    admin/       ResourceManager (CRUD), seletor de edição
    participante/
  hooks/         useApi
  lib/           db, http, auth, api-client
  server/        regras de negócio do back-end
  generated/     Prisma Client (gerado, fora do git)
  data/ services/ types/ utils/
```

Arquivos públicos:

```text
public/
  icons/
  images/
  logos/
  models/
  videos/
```

## Componentes implementados

### Header

Arquivo: `src/components/layout/Header.tsx`

Contém:

- marca textual `HACK` com símbolo IF em neon;
- detalhe `//2026`;
- navegação principal;
- botão `INSCREVA-SE`;
- botão de menu com ícone do `lucide-react`;
- comportamento responsivo para telas menores.

### Hero

Arquivos em `src/components/sections/Hero`.

Composição:

- `HeroContent.tsx`: texto principal, descrição, CTAs e status;
- `HeroVisual.tsx`: área preparada para o futuro visual 3D;
- `HeroSystemInfo.tsx`: painel técnico lateral;
- `HeroStats.tsx`: barra de estatísticas;
- `Hero.tsx`: composição geral da seção.

Arquivos futuros previstos:

```text
public/images/hero/if-3d.webp
public/videos/if-build.webm
```

### Concept Section

Arquivo: `src/components/sections/Concept/ConceptSection.tsx`

Contém:

- fluxo `DA IDEIA À SOLUÇÃO REAL`;
- etapas: Ideia, Conexão, Estrutura e Solução Real;
- bloco `Sobre o HACKIF`;
- pilares: Crie, Desenvolva e Impacte.

Imagens futuras previstas:

```text
public/images/process/idea.webp
public/images/process/connection.webp
public/images/process/structure.webp
public/images/process/solution.webp
```

## Scripts

```bash
npm run dev
```

Inicia o servidor de desenvolvimento.

```bash
npm run build
```

Gera a build de produção.

```bash
npm run start
```

Inicia o servidor de produção após o build.

```bash
npm run lint
```

Executa a verificação com ESLint.

## Áreas logadas e telas de acesso

Além da Home e de `/sobre`, o front tem telas ligadas à API (detalhes em `docs/BACKEND.md`):

- Acesso: `/cadastro`, `/entrar`, `/recuperar-senha`, `/redefinir-senha` — `src/components/layout/AuthLayout.tsx`
- Público: `/hackathon`, `/resultados`, `/regulamento` — usam o `Header` e o `Footer` da Home
- Participante, jurado, admin e `/conta` — `src/components/layout/AppShell.tsx`, menus em `navegacao.ts`

Componentes compartilhados dessas telas ficam em `src/components/ui/app.tsx` (`PageHeader`, `Panel`,
`Button`, `Field`, `Input`, `Badge`, `Alert`, `Table`…), com as mesmas cores e fontes da Home. Dados vêm
de `useApi` (`src/hooks/useApi.ts`) e `api()` (`src/lib/api-client.ts`).

## Estado atual

- Back-end, autenticação, inscrição, equipes, submissão, avaliação e resultados implementados.
- As imagens e vídeos 3D da Home serão adicionados posteriormente.
- A Home é um Server Component que lê a edição vigente (`src/server/home/dados.ts`) e repassa às seções: Hero (status, duração, tamanho de equipe, equipes inscritas), Próximo Desafio, Vencedores, FAQ (`#faq`) e CTA final. Sem edição ou sem banco, cada seção mantém o texto original.