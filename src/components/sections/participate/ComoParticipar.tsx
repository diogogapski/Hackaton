import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CircleUserRound,
  Copy,
  Crown,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  UserPlus,
  UsersRound,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import styles from "./ComoParticipar.module.css";

type Etapa = {
  numero: string;
  titulo: string;
  descricao: string;
  icon: LucideIcon;
};

const etapas: Etapa[] = [
  {
    numero: "01",
    titulo: "CONTA",
    descricao: "Crie sua conta no HackIF.",
    icon: CircleUserRound,
  },
  {
    numero: "02",
    titulo: "EQUIPE",
    descricao: "Crie sua equipe ou use um código.",
    icon: UsersRound,
  },
  {
    numero: "03",
    titulo: "CÓDIGO",
    descricao: "Compartilhe ou informe o código.",
    icon: KeyRound,
  },
  {
    numero: "04",
    titulo: "INTEGRANTES",
    descricao: "Reúna o número mínimo de pessoas.",
    icon: UserPlus,
  },
  {
    numero: "05",
    titulo: "INSCRITA",
    descricao: "Sua equipe está pronta para o desafio.",
    icon: BadgeCheck,
  },
];

const regras: {
  numero: string;
  titulo: string;
  texto: string;
  icon: LucideIcon;
}[] = [
  {
    numero: "01",
    titulo: "UMA EQUIPE POR EDIÇÃO",
    texto: "Uma pessoa só pode participar de uma equipe por edição.",
    icon: UserRoundCheck,
  },
  {
    numero: "02",
    titulo: "LIMITE DE INTEGRANTES",
    texto:
      "Ao atingir o máximo, o código deixa de aceitar novas entradas. Na edição atual: máximo de 5.",
    icon: UsersRound,
  },
  {
    numero: "03",
    titulo: "FIM DAS INSCRIÇÕES",
    texto:
      "Depois que o período termina, o código deixa de permitir novas entradas.",
    icon: LockKeyhole,
  },
  {
    numero: "04",
    titulo: "LISTA DE ESPERA",
    texto:
      "Com limite de equipes atingido, uma equipe completa entra na lista de espera.",
    icon: BadgeCheck,
  },
  {
    numero: "05",
    titulo: "EQUIPE DESCLASSIFICADA",
    texto: "Uma equipe desclassificada não aceita novos integrantes.",
    icon: XCircle,
  },
];

const passosCriar = [
  "Entre na sua conta.",
  "Acesse Minha equipe e escolha Criar equipe.",
  "Digite o nome da equipe. Só o nome é necessário.",
  "O sistema gera automaticamente um código de convite.",
  "Quem cria a equipe se torna o líder.",
  "Compartilhe o código pelo canal que preferir.",
];

const passosEntrar = [
  "Crie sua própria conta, caso ainda não tenha.",
  "Faça login.",
  "Acesse Minha equipe e escolha Entrar com código.",
  "Digite o código recebido do líder.",
  "Confirme a entrada.",
  "Você entra imediatamente se o código estiver válido e houver vaga.",
];

function Label({ numero, children }: { numero: string; children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.72rem] font-semibold uppercase text-foreground/55">
      <span className="text-accent">{numero} {"//"}</span> {children}
    </p>
  );
}

function SecaoTitulo({
  numero,
  children,
  destaque,
}: {
  numero: string;
  children: React.ReactNode;
  destaque?: React.ReactNode;
}) {
  return (
    <div className="max-w-[360px]">
      <Label numero={numero}>{destaque ?? "PROCESSO"}</Label>
      <h2 className="mt-3 font-display text-[clamp(2.1rem,4vw,4.3rem)] font-semibold uppercase leading-[0.92]">
        {children}
      </h2>
    </div>
  );
}

function Passos({ passos }: { passos: string[] }) {
  return (
    <ol className="mt-7 grid gap-4">
      {passos.map((passo, index) => (
        <li key={passo} className="grid grid-cols-[28px_1fr] gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent font-mono text-[0.7rem] font-bold text-[#050706]">
            {index + 1}
          </span>
          <p className="pt-0.5 text-[0.9rem] leading-5 text-foreground/72">
            {passo}
          </p>
        </li>
      ))}
    </ol>
  );
}

function Fluxo({
  labels,
  vertical = false,
}: {
  labels: string[];
  vertical?: boolean;
}) {
  return (
    <div
      className={`flex ${vertical ? "flex-col" : "flex-col sm:flex-row"} items-start sm:items-center`}
    >
      {labels.map((label, index) => (
        <div
          key={label}
          className={`flex ${vertical ? "flex-col" : "flex-col sm:flex-row"} items-start sm:items-center`}
        >
          <div className="flex min-h-14 min-w-28 flex-col justify-center border-l-2 border-accent pl-3">
            <span className="font-display text-[0.78rem] font-semibold uppercase text-foreground">
              {label}
            </span>
          </div>
          {index < labels.length - 1 ? (
            <div
              className={`flex ${vertical ? "h-9 w-7" : "h-9 w-9 sm:h-7 sm:w-10"} items-center justify-center text-accent/70`}
              aria-hidden="true"
            >
              {vertical ? (
                <ArrowDown size={18} strokeWidth={1.5} />
              ) : (
                <ArrowRight
                  size={18}
                  strokeWidth={1.5}
                  className="hidden sm:block"
                />
              )}
              {!vertical ? (
                <ArrowDown size={18} strokeWidth={1.5} className="sm:hidden" />
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ComoParticipar() {
  return (
    <div className={styles.technicalGrid}>
      <section className="border-b border-accent/20">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-6 py-16 md:px-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:py-24">
          <div>
            <Label numero="01">COMO PARTICIPAR</Label>
            <h1 className="mt-4 font-display text-[clamp(3.2rem,6vw,6.5rem)] font-semibold uppercase leading-[0.88]">
              <span className="block">COMO</span>
              <span className="block">PARTICIPAR</span>
              <span className="block">
                DO <span className="text-accent">HACKIF?</span>
                <span className="text-accent">_</span>
              </span>
            </h1>
            <p className="mt-6 max-w-md text-[1rem] leading-6 text-foreground/70">
              Crie sua conta, forme sua equipe e prepare-se para construir.
            </p>
            <div className="mt-7 flex max-w-md items-start gap-3 border border-accent/55 px-4 py-3">
              <CircleUserRound
                size={22}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div>
                <p className="font-display text-[0.82rem] font-semibold uppercase text-accent">
                  Cada integrante precisa ter a própria conta.
                </p>
              </div>
            </div>
          </div>

          <ol className="relative grid gap-6 sm:grid-cols-5 sm:gap-0">
            <div
              className={`${styles.flowLine} absolute left-[10%] right-[10%] top-8 hidden h-px bg-accent/40 sm:block`}
              aria-hidden="true"
            />
            {etapas.map((etapa) => {
              const Icon = etapa.icon;
              return (
                <li
                  key={etapa.numero}
                  className={`${styles.flowNode} relative z-10 grid grid-cols-[58px_1fr] gap-4 sm:block sm:px-3`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent bg-background text-accent sm:mx-auto">
                    <Icon size={24} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <div className="sm:mt-4 sm:text-center">
                    <p className="font-mono text-[0.7rem] font-semibold text-accent">
                      {etapa.numero}
                    </p>
                    <h2 className="mt-1 font-display text-[0.86rem] font-semibold uppercase text-accent">
                      {etapa.titulo}
                    </h2>
                    <p className="mt-2 text-[0.75rem] leading-4 text-foreground/60">
                      {etapa.descricao}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="border-b border-accent/20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:px-10 lg:grid-cols-[0.68fr_1.32fr] lg:py-20">
          <div>
            <SecaoTitulo numero="02" destaque="PRIMEIRO PASSO">
              <span className="block">ANTES DE TUDO,</span>
              <span className="block">
                CRIE SUA CONTA<span className="text-accent">._</span>
              </span>
            </SecaoTitulo>
            <p className="mt-6 max-w-sm text-[0.92rem] leading-5 text-foreground/68">
              Cada participante precisa ter a própria conta no HackIF. Durante o
              cadastro, escolha seu vínculo e aceite os termos para concluir.
            </p>
            <Link
              href="/cadastro"
              className="mt-7 inline-flex h-12 items-center gap-2 bg-accent px-6 font-display text-[0.78rem] font-bold uppercase !text-[#050706] transition-colors hover:bg-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Criar minha conta
              <ArrowUpRight
                size={15}
                strokeWidth={2}
                className="text-current"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="border-t border-accent/20 pt-6">
            <div>
              <p className="font-mono text-[0.7rem] uppercase text-foreground/55">
                Escolha seu vínculo
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { titulo: "ALUNO", icon: GraduationCap },
                  { titulo: "SERVIDOR", icon: BriefcaseBusiness },
                  { titulo: "EXTERNO", icon: CircleUserRound },
                ].map(({ titulo, icon: Icon }) => (
                  <div
                    key={titulo}
                    className="flex min-h-28 flex-col items-center justify-center border border-foreground/15 px-2 text-center"
                  >
                    <Icon
                      size={23}
                      strokeWidth={1.5}
                      className="text-accent"
                      aria-hidden="true"
                    />
                    <span className="mt-3 font-display text-[0.72rem] font-semibold uppercase">
                      {titulo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-accent/20">
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 lg:py-20">
          <SecaoTitulo numero="03" destaque="DOIS CAMINHOS">
            <span className="block">AGORA ESCOLHA</span>
            <span className="block text-accent">SEU CAMINHO._</span>
          </SecaoTitulo>
          <div className="mt-10 grid border-y border-foreground/15 lg:grid-cols-2">
            <article className="py-8 lg:pr-10">
              <Label numero="01">VOU CRIAR UMA EQUIPE</Label>
              <h3 className="mt-4 font-display text-[clamp(1.9rem,3.4vw,3.3rem)] font-semibold uppercase leading-[0.92]">
                VOU CRIAR
                <br />
                UMA <span className="text-accent">EQUIPE._</span>
              </h3>
              <Passos passos={passosCriar} />
              <div className="mt-7 max-w-sm border border-accent/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[0.68rem] uppercase text-foreground/58">
                    Código da equipe
                  </p>
                  <Copy
                    size={16}
                    strokeWidth={1.6}
                    className="text-accent"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-4 font-display text-[1.65rem] font-semibold text-accent">
                  HACKIF01
                </p>
                <div className="mt-4 inline-flex h-9 items-center gap-2 border border-accent/55 px-3 font-display text-[0.68rem] font-semibold uppercase text-accent">
                  <Copy size={13} strokeWidth={1.8} aria-hidden="true" />
                  Copiar código
                </div>
              </div>
            </article>

            <article className="border-t border-foreground/15 py-8 lg:border-l lg:border-t-0 lg:pl-10">
              <Label numero="02">RECEBI UM CÓDIGO</Label>
              <h3 className="mt-4 font-display text-[clamp(1.9rem,3.4vw,3.3rem)] font-semibold uppercase leading-[0.92]">
                RECEBI
                <br />
                UM <span className="text-accent">CÓDIGO._</span>
              </h3>
              <Passos passos={passosEntrar} />
              <div className="mt-7 max-w-sm border border-foreground/20 p-4">
                <p className="font-mono text-[0.68rem] uppercase text-foreground/58">
                  Entrar com código
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="flex h-10 items-center border border-foreground/20 bg-foreground/5 px-3 font-mono text-[0.8rem] text-foreground/75">
                    HACKIF01
                  </span>
                  <span className="flex h-10 items-center bg-accent px-4 font-display text-[0.68rem] font-bold uppercase text-[#050706]">
                    Entrar na equipe
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-accent/20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:px-10 lg:grid-cols-[0.68fr_1.32fr] lg:py-20">
          <div>
            <SecaoTitulo numero="04" destaque="O CÓDIGO">
              <span className="block">UM CÓDIGO.</span>
              <span className="block">
                UMA <span className="text-accent">EQUIPE._</span>
              </span>
            </SecaoTitulo>
            <p className="mt-6 max-w-sm text-[0.92rem] leading-5 text-foreground/68">
              O código identifica a equipe e permite que outros participantes
              entrem nela. O líder o visualiza em destaque no gerenciamento da
              equipe.
            </p>
          </div>
          <div className="grid content-center gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="border border-accent/50 p-5">
              <div className="flex items-center gap-3 text-accent">
                <RefreshCw size={22} strokeWidth={1.6} aria-hidden="true" />
                <span className="font-display text-[0.78rem] font-semibold uppercase">
                  Gerar novo código
                </span>
              </div>
              <p className="mt-4 text-[0.82rem] leading-5 text-foreground/63">
                O líder pode gerar um novo código a qualquer momento.
              </p>
            </div>
            <ArrowRight
              size={22}
              strokeWidth={1.5}
              className="mx-auto hidden text-accent md:block"
              aria-hidden="true"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-foreground/20 p-4">
                <p className="font-mono text-[0.65rem] uppercase text-foreground/48">
                  Código antigo
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <XCircle
                    size={16}
                    strokeWidth={1.8}
                    className="text-foreground/55"
                    aria-hidden="true"
                  />
                  <span className="font-display text-[0.72rem] font-semibold uppercase text-foreground/55">
                    Invalidado
                  </span>
                </div>
                <p className="mt-2 font-mono text-[0.82rem] text-foreground/35 line-through">
                  HACKIF01
                </p>
              </div>
              <div className="border border-accent/50 p-4">
                <p className="font-mono text-[0.65rem] uppercase text-foreground/48">
                  Novo código
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Check
                    size={16}
                    strokeWidth={1.8}
                    className="text-accent"
                    aria-hidden="true"
                  />
                  <span className="font-display text-[0.72rem] font-semibold uppercase text-accent">
                    Ativo
                  </span>
                </div>
                <p className="mt-2 font-mono text-[0.82rem] text-accent">
                  HACKIF02
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-accent/20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:px-10 lg:grid-cols-[0.68fr_1.32fr] lg:py-20">
          <div>
            <SecaoTitulo numero="05" destaque="EM FORMAÇÃO OU INSCRITA?">
              <span className="block">EM FORMAÇÃO</span>
              <span className="block">
                OU <span className="text-accent">INSCRITA?_</span>
              </span>
            </SecaoTitulo>
            <p className="mt-6 max-w-sm text-[0.92rem] leading-5 text-foreground/68">
              A equipe fica INSCRITA automaticamente quando alcança o número
              mínimo de integrantes. Antes disso, fica EM FORMAÇÃO.
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map((quantidade) => {
                const inscrita = quantidade >= 3;
                return (
                  <div
                    key={quantidade}
                    className={`border p-4 ${inscrita ? "border-accent/60" : "border-foreground/20"}`}
                  >
                    <p className="font-display text-[1.5rem] font-semibold leading-none">
                      {quantidade}
                    </p>
                    <p className="mt-1 font-mono text-[0.63rem] uppercase text-foreground/50">
                      {quantidade === 1 ? "integrante" : "integrantes"}
                    </p>
                    <div
                      className={`mt-4 flex items-center gap-2 ${inscrita ? "text-accent" : "text-foreground/58"}`}
                    >
                      {inscrita ? (
                        <Check size={16} strokeWidth={1.8} aria-hidden="true" />
                      ) : (
                        <UsersRound
                          size={16}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      )}
                      <span className="font-display text-[0.65rem] font-semibold uppercase">
                        {inscrita ? "Inscrita" : "Em formação"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-foreground/15 pt-5">
              <p className="text-[0.82rem] text-foreground/62">
                Na edição atual, a equipe tem de{" "}
                <span className="font-semibold text-accent">3</span> a{" "}
                <span className="font-semibold text-accent">5</span>{" "}
                integrantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-accent/20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:px-10 lg:grid-cols-[0.68fr_1.32fr] lg:py-20">
          <SecaoTitulo numero="06" destaque="REGRAS AUTOMÁTICAS">
            <span className="block">O SISTEMA</span>
            <span className="block">
              CUIDA DAS <span className="text-accent">REGRAS._</span>
            </span>
          </SecaoTitulo>
          <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-5">
            {regras.map((regra) => {
              const Icon = regra.icon;
              return (
                <li
                  key={regra.numero}
                  className="border-t border-foreground/18 pt-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[0.7rem] text-accent">
                      {regra.numero}
                    </span>
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      className="text-accent"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-5 font-display text-[0.82rem] font-semibold uppercase leading-4">
                    {regra.titulo}
                  </h3>
                  <p className="mt-3 text-[0.78rem] leading-5 text-foreground/60">
                    {regra.texto}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="border-b border-accent/20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:px-10 lg:grid-cols-[0.68fr_1.32fr] lg:py-20">
          <div>
            <SecaoTitulo numero="07" destaque="LIDERANÇA">
              <span className="block">QUEM CRIA,</span>
              <span className="block">
                LIDERA<span className="text-accent">._</span>
              </span>
            </SecaoTitulo>
            <p className="mt-6 max-w-sm text-[0.92rem] leading-5 text-foreground/68">
              Quem cria a equipe se torna automaticamente o líder.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="border border-foreground/16 p-5">
              <p className="font-display text-[0.78rem] font-semibold uppercase text-accent">
                O líder pode:
              </p>
              <ul className="mt-5 grid gap-3 text-[0.8rem] text-foreground/65">
                {[
                  [KeyRound, "Visualizar e compartilhar o código"],
                  [RefreshCw, "Gerar um novo código"],
                  [UsersRound, "Remover integrantes"],
                  [Crown, "Transferir a liderança"],
                ].map(([Icon, texto]) => {
                  const AcaoIcon = Icon as LucideIcon;
                  return (
                    <li key={texto as string} className="flex gap-3">
                      <AcaoIcon
                        size={16}
                        strokeWidth={1.6}
                        className="shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      {texto as string}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border border-foreground/16 p-5">
              <p className="font-display text-[0.72rem] font-semibold uppercase text-accent">
                Transferir liderança
              </p>
              <div className="mt-8 flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                  <Crown
                    size={21}
                    strokeWidth={1.5}
                    className="text-accent"
                    aria-hidden="true"
                  />
                  <span className="font-display text-[0.72rem] font-semibold uppercase">
                    Líder atual
                  </span>
                </div>
                <ArrowDown
                  size={18}
                  strokeWidth={1.5}
                  className="ml-0.5 text-accent/70"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3">
                  <UserRoundCheck
                    size={21}
                    strokeWidth={1.5}
                    className="text-accent"
                    aria-hidden="true"
                  />
                  <span className="font-display text-[0.72rem] font-semibold uppercase">
                    Novo líder
                  </span>
                </div>
              </div>
            </div>
            <div className="border border-foreground/16 p-5">
              <p className="font-display text-[0.72rem] font-semibold uppercase text-foreground/75">
                Se o líder sair
              </p>
              <div className="mt-8 flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                  <CircleUserRound
                    size={21}
                    strokeWidth={1.5}
                    className="text-foreground/75"
                    aria-hidden="true"
                  />
                  <span className="font-display text-[0.72rem] font-semibold uppercase">
                    Líder sai
                  </span>
                </div>
                <ArrowDown
                  size={18}
                  strokeWidth={1.5}
                  className="ml-0.5 text-accent/70"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3">
                  <Crown
                    size={21}
                    strokeWidth={1.5}
                    className="text-accent"
                    aria-hidden="true"
                  />
                  <span className="font-display text-[0.72rem] font-semibold uppercase">
                    Mais antigo assume
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-accent/20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:px-10 lg:grid-cols-[0.68fr_1.32fr] lg:py-20">
          <SecaoTitulo numero="08" destaque="RESUMO">
            <span className="block">DO ZERO</span>
            <span className="block text-accent">A INSCRIÇÃO._</span>
          </SecaoTitulo>
          <div className="flex items-center">
            <Fluxo
              labels={[
                "CRIAR CONTA",
                "CRIAR EQUIPE OU ENTRAR COM CÓDIGO",
                "REUNIR O MÍNIMO DE INTEGRANTES",
                "EQUIPE INSCRITA",
              ]}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-16 md:px-10 lg:grid-cols-[0.68fr_1.32fr] lg:items-end lg:py-24">
          <div>
            <Label numero="09">SUA VEZ</Label>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,5.2rem)] font-semibold uppercase leading-[0.9]">
              <span className="block">SUA EQUIPE</span>
              <span className="block">
                COMEÇA <span className="text-accent">AQUI._</span>
              </span>
            </h2>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-md text-[1rem] leading-6 text-foreground/70">
              Crie sua conta ou entre para uma equipe e participe do HackIF.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/cadastro"
                className="inline-flex h-12 items-center gap-2 bg-accent px-6 font-display text-[0.78rem] font-bold uppercase !text-[#050706] transition-colors hover:bg-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Inscreva-se{" "}
                <ArrowUpRight
                  size={15}
                  strokeWidth={2}
                  className="text-current"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center border border-accent/55 px-6 font-display text-[0.78rem] font-bold uppercase text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Já tenho uma conta
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
