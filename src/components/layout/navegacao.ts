// Menus das áreas logadas, por papel. Rotas conforme o planejamento de páginas (31 telas).

export const navAdmin = [
  { label: "Dashboard", href: "/admin" },
  { label: "Hackathons", href: "/admin/hackathons" },
  { label: "Usuários", href: "/admin/usuarios" },
  { label: "Equipes", href: "/admin/equipes" },
  { label: "Desafios", href: "/admin/desafios" },
  { label: "Agenda", href: "/admin/agenda" },
  { label: "Critérios", href: "/admin/criterios" },
  { label: "Projetos", href: "/admin/projetos" },
  { label: "Jurados", href: "/admin/jurados" },
  { label: "Avaliações", href: "/admin/avaliacoes" },
  { label: "Resultados", href: "/admin/resultados" },
  { label: "Comunicados", href: "/admin/comunicados" },
  { label: "Presença", href: "/admin/presenca" },
  { label: "Relatório", href: "/admin/relatorio" },
  { label: "Operação", href: "/admin/operacao" },
  { label: "Perfil", href: "/perfil" },
];

export const navJurado = [
  { label: "Painel", href: "/jurado" },
  { label: "Agenda", href: "/agenda" },
  { label: "Perfil", href: "/perfil" },
];

export const navParticipante = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Minha equipe", href: "/equipe" },
  { label: "Projeto", href: "/projeto" },
  { label: "Agenda", href: "/agenda" },
  { label: "Resultados", href: "/resultados" },
  { label: "Perfil", href: "/perfil" },
];

export const navPorPapel = { ADMIN: navAdmin, JURADO: navJurado, PARTICIPANTE: navParticipante } as const;
