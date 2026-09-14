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
    globals.css
    layout.tsx
    page.tsx
  components/
    layout/
      Header.tsx
    sections/
      Hero/
        Hero.tsx
        HeroContent.tsx
        HeroVisual.tsx
        HeroSystemInfo.tsx
        HeroStats.tsx
      Concept/
        ConceptSection.tsx
    ui/
  data/
  hooks/
  services/
  types/
  utils/
```

Arquivos públicos:

```text
public/
  icons/
  images/
  logos/
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

## Estado atual

- O projeto ainda não possui backend.
- Não há autenticação implementada.
- O formulário de inscrição ainda não foi criado.
- As imagens e vídeos 3D serão adicionados posteriormente.
- O foco atual é a construção da interface inicial da Home.
