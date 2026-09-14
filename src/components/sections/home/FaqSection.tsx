import { Plus } from "lucide-react";
import type { DadosHome } from "@/src/server/home/dados";

const data = (d: Date | null | undefined) =>
  d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", timeZone: "America/Sao_Paulo" }) : null;

/** Perguntas frequentes; respostas usam as regras configuradas na edição quando existirem. */
function perguntas(dados: DadosHome) {
  const equipe = dados ? `de ${dados.limiteMinIntegrantes} a ${dados.limiteMaxIntegrantes} integrantes` : "de 3 a 5 integrantes";
  const criterios = dados?.criterios.length
    ? `Os projetos são avaliados pelos critérios ${dados.criterios.map((c) => `${c.nome} (peso ${c.peso})`).join(", ")}, com notas de ${dados.notaMin} a ${dados.notaMax}. A nota final é a média ponderada pelos pesos.`
    : "Os projetos são avaliados por jurados, com critérios e pesos definidos pela organização e divulgados antes do evento.";

  return [
    {
      p: "Quem pode participar?",
      r: "Alunos do IFPR, servidores, egressos e participantes externos. Basta criar a conta com o seu vínculo e aceitar os termos de uso.",
    },
    {
      p: "Quantas pessoas por equipe?",
      r: `Cada equipe tem ${equipe}. A equipe só fica inscrita ao atingir o mínimo.`,
    },
    {
      p: "Preciso já ter uma equipe para me cadastrar?",
      r: "Não. Depois do cadastro você pode criar uma equipe (e virar líder) ou entrar em uma existente com o código de convite do líder.",
    },
    {
      p: "Até quando dá para se inscrever e enviar o projeto?",
      r: dados
        ? `Inscrições ${dados.inscricaoFim ? `até ${data(dados.inscricaoFim)}` : "abertas enquanto a organização mantiver o período ativo"}; envio do projeto até ${data(dados.prazoSubmissao)}. O projeto pode ser editado até o prazo.`
        : "As datas de inscrição e de envio dos projetos são publicadas junto com a edição.",
    },
    { p: "Como os projetos são avaliados?", r: criterios },
    {
      p: "Quando saem os resultados?",
      r: "Depois que todos os jurados avaliarem, a organização revisa o ranking e publica os resultados nesta página e em Resultados.",
    },
  ];
}

export function FaqSection({ dados }: { dados: DadosHome }) {
  return (
    <section id="faq" className="border-t border-foreground/10 bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 md:px-10 lg:grid-cols-[0.36fr_0.64fr] lg:gap-16">
        <div>
          <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
            <span className="text-accent">07 //</span> FAQ
          </p>
          <h2 className="mt-7 font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
            <span className="block text-foreground">PERGUNTAS</span>
            <span className="block text-accent">FREQUENTES._</span>
          </h2>
          <p className="mt-8 max-w-[420px] font-display text-base leading-7 text-foreground/64 md:text-[1.05rem]">
            Ainda com dúvida? Consulte o <a href="/regulamento" className="text-accent hover:text-foreground">regulamento</a>.
          </p>
        </div>

        <div className="border-t border-foreground/12">
          {perguntas(dados).map((item, i) => (
            <details key={item.p} className="group border-b border-foreground/12">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-[1.05rem] font-semibold uppercase text-foreground transition-colors hover:text-accent md:text-[1.2rem] [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="mr-4 font-mono text-[0.78rem] text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {item.p}
                </span>
                <Plus size={22} strokeWidth={1.5} className="shrink-0 text-accent transition-transform group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="max-w-[720px] pb-7 pl-9 font-display text-[1rem] leading-7 text-foreground/64">{item.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
