import { Header } from "../components/layout/Header";
import { ConceptSection } from "../components/sections/Concept/ConceptSection";
import { Hero } from "../components/sections/Hero/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main aria-label="Conteúdo principal">
        <Hero />
        <ConceptSection />
      </main>
    </div>
  );
}
