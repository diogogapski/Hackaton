import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ConceptSection } from "../components/sections/Concept/ConceptSection";
import { Hero } from "../components/sections/Hero/Hero";
import { FaqSection } from "../components/sections/home/FaqSection";
import { FinalCTASection } from "../components/sections/home/FinalCTASection";
import { HowItWorksSection } from "../components/sections/home/HowItWorksSection";
import { NextChallengeSection } from "../components/sections/home/NextChallengeSection";
import { TestimonialsSection } from "../components/sections/home/TestimonialsSection";
import { WinnersSection } from "../components/sections/home/WinnersSection";
import { carregarDadosHome } from "../server/home/dados";

export default async function Home() {
  const dados = await carregarDadosHome();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main aria-label="Conteúdo principal">
        <Hero dados={dados} />
        <ConceptSection />
        <NextChallengeSection dados={dados} />
        <WinnersSection dados={dados} />
        <HowItWorksSection />
        <TestimonialsSection />
        <FaqSection dados={dados} />
        <FinalCTASection dados={dados} />
      </main>
      <Footer />
    </div>
  );
}
