import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { ComoParticipar } from "@/src/components/sections/participate/ComoParticipar";

export default function ComoParticiparPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main aria-label="Como participar do HackIF">
        <ComoParticipar />
      </main>
      <Footer />
    </div>
  );
}
