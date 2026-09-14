import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rotas anteriores ao alinhamento com o planejamento de páginas (docs/planejamento).
  redirects() {
    return [
      { source: "/entrar", destination: "/login", permanent: true },
      { source: "/conta", destination: "/perfil", permanent: true },
      { source: "/participante/equipe", destination: "/equipe", permanent: true },
      { source: "/participante/projeto", destination: "/projeto", permanent: true },
      { source: "/admin/edicoes", destination: "/admin/hackathons", permanent: true },
    ];
  },
};

export default nextConfig;
