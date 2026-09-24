"use client";

import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type EstadoPeriodo = "EM_BREVE" | "ABERTAS" | "ENCERRADAS";

type RegistrationStatusPanelProps = {
  inscricaoInicio: string | null;
  inscricaoFim: string | null;
  inscricoesAbertas: boolean;
  agoraInicial: number;
};

const paraTimestamp = (data: string | null) => {
  if (!data) return null;
  const timestamp = new Date(data).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

function determinarEstado(
  agora: number,
  inicio: number | null,
  fim: number | null,
  abertasSemPeriodo: boolean,
): EstadoPeriodo {
  if (inicio !== null && agora < inicio) return "EM_BREVE";
  if (fim !== null && agora >= fim) return "ENCERRADAS";
  if (inicio !== null || fim !== null || abertasSemPeriodo) return "ABERTAS";
  return "ENCERRADAS";
}

function separarTempo(restante: number) {
  const totalSegundos = Math.max(0, Math.ceil(restante / 1000));
  const dias = Math.floor(totalSegundos / 86_400);
  const horas = Math.floor((totalSegundos % 86_400) / 3_600);
  const minutos = Math.floor((totalSegundos % 3_600) / 60);
  const segundos = totalSegundos % 60;
  return [dias, horas, minutos, segundos].map((valor) => String(valor).padStart(2, "0"));
}

function Countdown({ destino, agoraInicial, onComplete }: { destino: number; agoraInicial: number; onComplete: () => void }) {
  const [restante, setRestante] = useState(() => Math.max(0, destino - agoraInicial));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const atualizar = () => {
      const proximoRestante = Math.max(0, destino - Date.now());
      setRestante(proximoRestante);
      if (proximoRestante === 0) {
        onComplete();
        return;
      }
      timer = setTimeout(atualizar, 1000);
    };

    timer = setTimeout(atualizar, 1000);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [destino, onComplete]);

  const valores = separarTempo(restante);
  const unidades = ["DIAS", "HRS", "MIN", "SEG"];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-start" role="timer" aria-live="off">
      {valores.map((valor, index) => (
        <div key={unidades[index]} className="contents">
          <div className="min-w-0 text-center">
            <span className="block font-mono text-[clamp(1.45rem,5.8vw,2.65rem)] font-semibold leading-none tabular-nums text-accent">{valor}</span>
            <span className="mt-2 block font-mono text-[0.55rem] uppercase text-foreground/75 sm:text-[0.64rem]">{unidades[index]}</span>
          </div>
          {index < valores.length - 1 ? (
            <span className="px-1 font-mono text-[clamp(1.45rem,5.8vw,2.65rem)] font-semibold leading-none text-accent sm:px-2" aria-hidden="true">:</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function RegistrationStatusPanel({
  inscricaoInicio,
  inscricaoFim,
  inscricoesAbertas,
  agoraInicial,
}: RegistrationStatusPanelProps) {
  const inicio = paraTimestamp(inscricaoInicio);
  const fim = paraTimestamp(inscricaoFim);
  const [periodo, setPeriodo] = useState(() => ({
    estado: determinarEstado(agoraInicial, inicio, fim, inscricoesAbertas),
    agora: agoraInicial,
  }));

  const atualizarEstado = useCallback(() => {
    const agora = Date.now();
    setPeriodo({ estado: determinarEstado(agora, inicio, fim, inscricoesAbertas), agora });
  }, [fim, inicio, inscricoesAbertas]);

  const emBreve = periodo.estado === "EM_BREVE";
  const abertas = periodo.estado === "ABERTAS";
  const destino = emBreve ? inicio : abertas ? fim : null;

  return (
    <aside className="relative mt-5 min-h-[190px] border border-accent/70 bg-background px-5 py-7 md:px-8 lg:grid lg:grid-cols-[0.55fr_0.45fr] lg:items-center lg:px-10 lg:py-8" aria-label="Período de inscrições">
      <span className="absolute left-[-1px] top-[-1px] h-5 w-5 border-l-2 border-t-2 border-accent" aria-hidden="true" />
      <span className="absolute right-[-1px] top-[-1px] h-5 w-5 border-r-2 border-t-2 border-accent/75" aria-hidden="true" />
      <span className="absolute bottom-[-1px] left-[-1px] h-5 w-5 border-b-2 border-l-2 border-accent/75" aria-hidden="true" />
      <span className="absolute bottom-[-1px] right-[-1px] h-5 w-5 border-b-2 border-r-2 border-accent" aria-hidden="true" />

      <div className={destino !== null ? "lg:pr-12" : "lg:pr-10"}>
        <div className="flex items-center gap-3 text-accent">
          <Clock3 size={28} strokeWidth={1.7} className="shrink-0" aria-hidden="true" />
          <p className="font-display text-[0.7rem] font-semibold uppercase sm:text-[0.76rem]">
            {emBreve ? "INSCRIÇÕES EM BREVE" : abertas ? "INSCRIÇÕES ABERTAS" : "INSCRIÇÕES ENCERRADAS"}
          </p>
        </div>
        <h3 className="mt-4 font-display text-[clamp(1.65rem,3vw,2.55rem)] font-semibold uppercase leading-[0.98] text-foreground">
          {emBreve ? (
            <>PREPARE SUA<br /><span className="text-accent">EQUIPE._</span></>
          ) : abertas ? (
            <>AINDA DÁ TEMPO DE<br /><span className="text-accent">ENTRAR NESSA._</span></>
          ) : (
            <>ESSA EDIÇÃO JÁ<br /><span className="text-accent">COMEÇOU A SER CONSTRUÍDA._</span></>
          )}
        </h3>
        <p className="mt-4 max-w-xl text-[0.88rem] leading-5 text-foreground/72">
          {emBreve
            ? "As inscrições ainda não começaram."
            : abertas
              ? "Reúna sua equipe e faça sua inscrição."
              : <>As inscrições desta edição foram encerradas.<br />Esperamos você na próxima edição.</>}
        </p>
      </div>

      {destino !== null ? (
        <div className="mt-7 border-t border-foreground/25 pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:py-1 lg:pl-12">
          <p className="mb-5 font-display text-[0.68rem] font-semibold uppercase text-foreground/85">{emBreve ? "ABRE EM" : "ENCERRA EM"}</p>
          <Countdown key={destino} destino={destino} agoraInicial={periodo.agora} onComplete={atualizarEstado} />
          {abertas ? (
            <Link href="/cadastro" className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 bg-accent px-6 font-display text-[0.78rem] font-bold uppercase text-[#050706] transition-colors hover:bg-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-auto lg:min-w-[190px]">
              INSCREVA-SE
              <ArrowUpRight size={14} strokeWidth={2} className="text-current" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
