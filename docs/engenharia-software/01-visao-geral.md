# Visão geral

## Contexto e objetivo

O HackIF é um sistema web de apoio à organização do Hackathon de Ciência da Computação do IFPR Campus Pinhais. O sistema reúne informações públicas do evento e áreas autenticadas para participantes, jurados e administração. Seu objetivo é apoiar o ciclo de uma edição: divulgação, inscrições, organização de equipes, submissão de projetos, avaliação, resultados e operação administrativa.

## Público e módulos

Os públicos do sistema são visitantes, participantes, jurados e comissão organizadora. A comissão utiliza as funções administrativas para configurar e conduzir a edição do evento.

Os módulos implementados abrangem identidade e autenticação, perfil, equipes, edição do hackathon, desafios, agenda, comunicados, projetos, avaliação, ranking, resultados, presença, relatórios e operações de privacidade. Há páginas públicas como Home, Hackathon, desafios, agenda, resultados, regulamento, FAQ, privacidade, sobre e como participar.

## Tecnologias

| Camada | Tecnologias | Utilização |
|---|---|---|
| Interface | Next.js 16, React 19 e TypeScript | Páginas, componentes e rotas da aplicação web. |
| Estilização e interação | Tailwind CSS, Framer Motion e lucide-react | Layout responsivo, animações e ícones. |
| Recursos 3D | Three.js, React Three Fiber e Drei | Logotipo e elementos tridimensionais baseados em modelo GLB. |
| API e serviços | Route Handlers do Next.js, TypeScript e Zod | Endpoints, regras de domínio e validação de dados. |
| Persistência | Prisma ORM, SQLite e PostgreSQL | SQLite no desenvolvimento e PostgreSQL no ambiente Railway. |
| E-mail | Resend | Envio transacional de recuperação de senha e verificação de e-mail. |
| Infraestrutura | Railway e GitHub Actions | Hospedagem, deploy e integração contínua. |

## Processo em síntese

O planejamento inicial registra três frentes de desenvolvimento: Front-end, Back-end 1 e Back-end 2. O trabalho é organizado por Sprints e Product Backlog no GitHub Project `HACKIF DESENVOLVIMENTO`, com evolução incremental do produto.
