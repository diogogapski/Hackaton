import type { Metadata } from "next";
import { connection } from "next/server";
import {
  Archivo,
  Chakra_Petch,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";

import "./globals.css";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HACKIF 2026",
  description: "1º Hackathon de Ciência da Computação do IFPR Campus Pinhais",
  icons: {
    icon: "/images/IFNeon.ico",
    apple: "/images/IFNeon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // A CSP usa um nonce por resposta, inclusive nas páginas públicas.
  await connection();
  return (
    <html lang="pt-BR">
      <body
        className={`
          ${chakraPetch.variable}
          ${archivo.variable}
          ${ibmPlexSans.variable}
          ${ibmPlexMono.variable}
        `}
      >
        {children}
      </body>
    </html>
  );
}
