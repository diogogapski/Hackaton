import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { AboutHero } from "../../components/sections/about/AboutHero";
import { AboutNarrative } from "../../components/sections/about/AboutNarrative";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main aria-label="Conteúdo principal da página Sobre">
        <AboutHero />
        <AboutNarrative />
      </main>
      <Footer />
    </div>
  );
}
