import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      ...(process.env.NODE_ENV === "production"
        ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
        : []),
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/auth/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/api/perfil/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/verificar-email", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
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
