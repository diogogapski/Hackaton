// Menus das áreas logadas, por papel.

export const navAdmin = [
  { label: "Dashboard", href: "/admin" },
  { label: "Edições", href: "/admin/edicoes" },
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
  { label: "Conta", href: "/conta" },
];

export const navJurado = [
  { label: "Meus projetos", href: "/jurado" },
  { label: "Conta", href: "/conta" },
];

export const navParticipante = [
  { label: "Equipe", href: "/participante/equipe" },
  { label: "Projeto", href: "/participante/projeto" },
  { label: "Edição", href: "/hackathon" },
  { label: "Resultados", href: "/resultados" },
  { label: "Conta", href: "/conta" },
];

export const navPorPapel = { ADMIN: navAdmin, JURADO: navJurado, PARTICIPANTE: navParticipante } as const;
