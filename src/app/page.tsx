import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ConceptSection } from "../components/sections/Concept/ConceptSection";
import { Hero } from "../components/sections/Hero/Hero";
import { FinalCTASection } from "../components/sections/home/FinalCTASection";
import { HowItWorksSection } from "../components/sections/home/HowItWorksSection";
import { NextChallengeSection } from "../components/sections/home/NextChallengeSection";
import { TestimonialsSection } from "../components/sections/home/TestimonialsSection";
import { WinnersSection } from "../components/sections/home/WinnersSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main aria-label="Conteúdo principal">
        <Hero />
        <ConceptSection />
        <NextChallengeSection />
        <WinnersSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
