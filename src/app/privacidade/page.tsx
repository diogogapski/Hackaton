import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { BarraSistema } from "@/src/components/publico/BarraSistema";

export const metadata: Metadata = { title: "Aviso de privacidade · HACKIF" };

const secoes: { titulo: string; itens: React.ReactNode[] }[] = [
  {
    titulo: "Quem trata os dados",
    itens: [
      "A comissão organizadora do Hackathon do curso de Ciência da Computação do IFPR Campus Pinhais, responsável por inscrições, agenda, avaliação e divulgação dos resultados.",
    ],
  },
  {
    titulo: "Quais dados coletamos e por quê",
    itens: [
      "Nome e e-mail: identificar você, permitir o acesso e contatar sobre o evento.",
      "Vínculo com o IFPR e matrícula (alunos), SIAPE (servidores) ou CPF (egressos e externos, opcional): evitar cadastros duplicados e confirmar quem pode participar.",
      "Curso e telefone (opcionais): organização das equipes e contato durante o evento.",
      "Equipe, projeto enviado e notas atribuídas: operar a inscrição, a avaliação e a apuração do resultado.",
      "Endereço IP de tentativas de login malsucedidas, guardado por até 24 horas: proteção contra acesso indevido.",
    ],
  },
  {
    titulo: "O que fica público",
    itens: [
      "Agenda, desafios, comunicados e, após publicação pela comissão, a classificação com nome da equipe e do projeto.",
      "Notas e a lista de equipes só aparecem publicamente se a comissão habilitar essa opção. Nomes, e-mails e documentos de participantes nunca são exibidos publicamente.",
    ],
  },
  {
    titulo: "Quem acessa",
    itens: [
      "A comissão organizadora (perfil administrador). Jurados veem o projeto e os nomes dos integrantes das equipes que avaliam. Os integrantes veem os dados da própria equipe.",
      "Os dados não são vendidos nem compartilhados com terceiros.",
    ],
  },
  {
    titulo: "Por quanto tempo",
    itens: [
      "Pelo período necessário à realização do evento e à prestação de contas, conforme o prazo definido pela comissão organizadora e informado no regulamento da edição.",
    ],
  },
  {
    titulo: "Seus direitos (LGPD, art. 18)",
    itens: [
      <>Consultar e corrigir seus dados em <Link href="/perfil" className="text-accent underline">Perfil</Link>.</>,
      <>Excluir sua conta a qualquer momento, também em <Link href="/perfil" className="text-accent underline">Perfil</Link>: seus dados pessoais são apagados e projetos e avaliações já registrados permanecem sem identificar você.</>,
      "Tirar dúvidas ou fazer outros pedidos diretamente com a comissão organizadora.",
    ],
  },
];

/** Aviso de privacidade exigido no cadastro (planejamento, página 10). */
export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <BarraSistema />
      <main className="mx-auto max-w-[960px] px-6 py-16 md:px-10">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">{"// lgpd"}</p>
        <h1 className="mt-3 font-display text-[2.6rem] font-semibold uppercase leading-none tracking-[-0.03em] md:text-[3.4rem]">Aviso de privacidade</h1>
        <p className="mt-5 text-muted">Como o HACKIF usa os dados pessoais de participantes, jurados e organizadores, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>

        <div className="mt-12 grid gap-10">
          {secoes.map((s, i) => (
            <section key={s.titulo}>
              <h2 className="font-display text-[1.3rem] font-semibold uppercase">
                <span className="mr-3 font-mono text-[0.85rem] text-accent">{String(i + 1).padStart(2, "0")}</span>{s.titulo}
              </h2>
              <ul className="mt-4 grid gap-2 border-l-2 border-accent/30 pl-6 text-[0.98rem] leading-relaxed text-foreground/80">
                {s.itens.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
