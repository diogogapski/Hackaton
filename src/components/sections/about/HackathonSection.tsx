const concepts = [
  { title: "CRIAR", text: "Pensar além do óbvio." },
  { title: "COLABORAR", text: "Construir com diferentes pessoas." },
  { title: "RESOLVER", text: "Transformar problemas em soluções." },
] as const;

export function HackathonSection() {
  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 md:px-10 lg:grid-cols-[0.42fr_0.58fr]">
        <div>
          <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
            <span className="text-accent">03 //</span> HACKATHON
          </p>
          <h2 className="mt-7 font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
            <span className="block text-foreground">NÃO É SÓ</span>
            <span className="block text-accent">SOBRE PROGRAMAR._</span>
          </h2>
          <p className="mt-8 max-w-[560px] font-display text-base leading-7 text-foreground/64 md:text-[1.05rem]">
            Um hackathon é uma experiência intensiva de criação e colaboração. Durante um período determinado, equipes trabalham sobre um desafio, desenvolvem uma proposta e transformam suas ideias em uma solução.
          </p>
        </div>
        <div className="space-y-10">
          {concepts.map((concept, index) => (
            <div key={concept.title}>
              <h3 className="font-display text-[clamp(2.3rem,5vw,5.6rem)] font-semibold uppercase leading-none text-accent">
                {concept.title}
              </h3>
              <p className="mt-3 font-display text-[1rem] text-foreground/58">{concept.text}</p>
              {index < concepts.length - 1 ? (
                <p className="mt-8 font-display text-2xl text-foreground/25" aria-hidden="true">↓</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
