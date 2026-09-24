import { connection } from "next/server";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ConceptSection } from "../components/sections/Concept/ConceptSection";
import { Hero } from "../components/sections/Hero/Hero";
import { FinalCTASection } from "../components/sections/home/FinalCTASection";
import { HowItWorksSection } from "../components/sections/home/HowItWorksSection";
import { NextChallengeSection } from "../components/sections/home/NextChallengeSection";
import { TestimonialsSection } from "../components/sections/home/TestimonialsSection";
import { WinnersSection } from "../components/sections/home/WinnersSection";
import { AgendaPreviewSection } from "../components/sections/home/AgendaPreviewSection";
import { carregarDadosHome } from "@/src/server/home/dados";

export default async function Home() {
  await connection();
  const dados = await carregarDadosHome();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main aria-label="Conteúdo principal">
        <Hero edicao={dados?.edicao ?? null} />
        <ConceptSection />
        <NextChallengeSection desafio={dados?.desafio ?? null} edicao={dados?.edicao ?? null} agoraInicial={dados?.carregadoEm ?? 0} />
        <AgendaPreviewSection agenda={dados?.agenda ?? []} />
        <WinnersSection winners={dados?.vencedores ?? []} />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
