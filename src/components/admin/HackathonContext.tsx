"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useApi } from "@/src/hooks/useApi";
import { comHackathon } from "@/src/lib/api-client";

export type HackathonResumo = { id: string; nome: string; status: string };

type Ctx = {
  hackathonId: string | null;
  setHackathonId: (id: string | null) => void;
  hackathons: HackathonResumo[];
  /** Acrescenta `?hackathonId=` ao caminho quando uma edição foi escolhida. */
  url: (path: string) => string;
  recarregarHackathons: () => void;
};

const HackathonContext = createContext<Ctx | null>(null);
const CHAVE = "hackif.admin.hackathonId";

export function HackathonProvider({ children }: { children: ReactNode }) {
  const { data, reload } = useApi<{ hackathons: HackathonResumo[] }>("/api/admin/hackathons");
  const [hackathonId, setId] = useState<string | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restaura escolha salva no navegador
      setId(localStorage.getItem(CHAVE));
    } catch {}
  }, []);

  const hackathons = data?.hackathons ?? [];
  const valido = hackathonId && hackathons.some((h) => h.id === hackathonId) ? hackathonId : null;

  const setHackathonId = (id: string | null) => {
    setId(id);
    try {
      if (id) localStorage.setItem(CHAVE, id);
      else localStorage.removeItem(CHAVE);
    } catch {}
  };

  return (
    <HackathonContext.Provider
      value={{ hackathonId: valido, setHackathonId, hackathons, url: (p) => comHackathon(p, valido), recarregarHackathons: reload }}
    >
      {children}
    </HackathonContext.Provider>
  );
}

export function useHackathon() {
  const ctx = useContext(HackathonContext);
  if (!ctx) throw new Error("useHackathon precisa de HackathonProvider");
  return ctx;
}

export function HackathonSelector() {
  const { hackathonId, setHackathonId, hackathons } = useHackathon();
  if (hackathons.length === 0) return null;

  return (
    <select
      value={hackathonId ?? ""}
      onChange={(e) => setHackathonId(e.target.value || null)}
      className="max-w-[240px] border border-foreground/15 bg-background px-2 py-1.5 font-mono text-[0.72rem] uppercase text-foreground/80 outline-none focus:border-accent"
      aria-label="Edição"
    >
      <option value="">Edição atual (automática)</option>
      {hackathons.map((h) => (
        <option key={h.id} value={h.id}>
          {h.nome} · {h.status}
        </option>
      ))}
    </select>
  );
}
