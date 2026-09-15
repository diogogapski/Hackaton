import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { PaginaPublica } from "@/src/components/publico/PaginaPublica";
import { prisma } from "@/src/lib/db";
import { getHackathonAtual } from "@/src/server/hackathon/atual";

export const metadata = { title: "FAQ · HACKIF 2026" };

const dataHora = (d: Date) =>
  d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

async function carregarEdicao() {
  try {
    const hackathon = await getHackathonAtual();
    if (!hackathon) return null;
    const criterios = await prisma.criterio.findMany({
      where: { hackathonId: hackathon.id },
      orderBy: { ordem: "asc" },
      select: { nome: true, peso: true, prioridadeDesempate: true },
    });
    return { hackathon, criterios };
  } catch {
    return null;
  }
}

const destaque = (texto: ReactNode) => <strong className="font-semibold text-foreground">{texto}</strong>;
const link = (href: string, texto: string) => (
  <Link href={href} className="text-accent underline-offset-4 hover:underline">{texto}</Link>
);

/** Perguntas frequentes com as regras reais da edição atual (vindas do banco). */
export default async function FaqPage() {
  await connection();
  const edicao = await carregarEdicao();
  const h = edicao?.hackathon;
  const criterios = edicao?.criterios ?? [];
  const desempate = criterios.filter((c) => c.prioridadeDesempate != null).sort((a, b) => a.prioridadeDesempate! - b.prioridadeDesempate!);

  const perguntas: { p: string; r: ReactNode }[] = [
    {
      p: "Quem pode participar?",
      r: <>Alunos do IFPR, servidores e professores, egressos e convidados externos. Cada pessoa cria a própria conta em {link("/cadastro", "Inscreva-se")}, escolhendo o vínculo.</>,
    },
    {
      p: "Quantas pessoas por equipe?",
      r: h
        ? <>Cada equipe tem de {destaque(h.limiteMinIntegrantes)} a {destaque(h.limiteMaxIntegrantes)} integrantes. A equipe só fica {destaque("inscrita")} quando atinge o mínimo.</>
        : <>O tamanho mínimo e máximo das equipes é definido pela organização em cada edição.</>,
    },
    {
      p: "Até quando posso me inscrever?",
      r: h?.inscricaoFim
        ? <>As inscrições vão {h.inscricaoInicio ? <>de {destaque(dataHora(h.inscricaoInicio))} </> : null}até {destaque(dataHora(h.inscricaoFim))}.</>
        : h
          ? <>As inscrições acompanham a situação da edição, divulgada em {link("/hackathon", "O Hackathon")} e nos comunicados.</>
          : <>As datas serão divulgadas em {link("/agenda", "Agenda")} assim que a edição for aberta.</>,
    },
    {
      p: "Como monto minha equipe?",
      r: <>Depois de entrar, vá em {destaque("Minha equipe")}: crie a equipe e compartilhe o {destaque("código de convite")} com os colegas, ou entre numa equipe existente usando o código que recebeu. O líder pode remover integrantes e transferir a liderança.</>,
    },
    ...(h?.limiteEquipes
      ? [{
          p: "Existe limite de equipes?",
          r: <>Sim: {destaque(h.limiteEquipes)} equipes inscritas. Equipes completas além disso entram na {destaque("lista de espera")}, na ordem em que completaram, e são chamadas automaticamente quando abre vaga.</>,
        }]
      : []),
    {
      p: "Preciso ter uma ideia pronta?",
      r: <>Não. Os problemas são apresentados em {link("/desafios", "Desafios")} e a equipe escolhe um ao enviar o projeto.</>,
    },
    {
      p: "Como e até quando envio o projeto?",
      r: <>O líder cadastra o projeto em {destaque("Projeto")} com descrição, tecnologias e links (repositório, vídeo, apresentação) e clica em enviar{h ? <>, até {destaque(dataHora(h.prazoSubmissao ?? h.dataFim))}</> : null}. Só projetos enviados são avaliados.</>,
    },
    {
      p: "Como os projetos são avaliados?",
      r: criterios.length && h
        ? <>Jurados dão notas de {destaque(h.notaMin)} a {destaque(h.notaMax)} em cada critério: {criterios.map((c, i) => <span key={c.nome}>{i ? ", " : ""}{destaque(c.nome)} (peso {c.peso})</span>)}. A nota final é a média ponderada.{desempate.length ? <> Em caso de empate, vale a maior nota em {desempate.map((c) => c.nome).join(", depois ")} e, por fim, quem enviou antes.</> : null}</>
        : <>Por uma banca de jurados, com critérios e pesos definidos pela organização e publicados antes do evento.</>,
    },
    {
      p: "Quando saem os resultados?",
      r: <>Depois que todas as avaliações forem concluídas, a comissão publica o resultado em {link("/resultados", "Resultados")}.</>,
    },
    {
      p: "E se a agenda mudar?",
      r: <>Qualquer mudança de horário, local ou cancelamento aparece em {link("/agenda", "Agenda")} e vira um comunicado automático no painel.</>,
    },
    {
      p: "Esqueci minha senha. E agora?",
      r: <>Use {link("/recuperar-senha", "Esqueci minha senha")} para gerar um link de redefinição. Se não conseguir, procure a organização.</>,
    },
    {
      p: "O que acontece com meus dados?",
      r: <>Usamos só o necessário para inscrição, equipes e avaliação. Você pode editar seus dados ou excluir a conta no Perfil. Detalhes em {link("/privacidade", "Privacidade")}.</>,
    },
  ];

  return (
    <PaginaPublica
      tag="faq"
      titulo="Perguntas frequentes"
      descricao={h ? <>Regras da edição {h.nome}{h.local && !h.nome.includes(h.local) ? ` · ${h.local}` : ""}. Não achou sua dúvida? Leia o {link("/regulamento", "regulamento")}.</> : "Dúvidas comuns sobre inscrição, equipes, projetos e avaliação."}
    >
      <div className="grid max-w-4xl gap-3">
        {perguntas.map((item, i) => (
          <details key={item.p} className="group border border-foreground/10 bg-foreground/[0.02] open:border-accent/40" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 md:px-6 [&::-webkit-details-marker]:hidden">
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-[0.72rem] text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-[1.05rem] font-semibold uppercase leading-snug md:text-[1.15rem]">{item.p}</span>
              </span>
              <span className="shrink-0 font-mono text-[1.2rem] text-accent transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <div className="border-t border-foreground/10 px-5 py-4 text-[0.98rem] leading-relaxed text-foreground/75 md:px-6 md:pl-[3.9rem]">{item.r}</div>
          </details>
        ))}
      </div>
    </PaginaPublica>
  );
}
