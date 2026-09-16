import { Crosshair } from "lucide-react";
import type { EdicaoHome } from "../home/types";

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });

export function HeroSystemInfo({ edicao }: { edicao: EdicaoHome | null }) {
  const systemItems = [
    { label: "LOCAL:", value: edicao?.local ?? "IFPR PINHAIS" },
    { label: "EVENTO:", value: edicao ? `${dataCurta(edicao.dataInicio)} - ${dataCurta(edicao.dataFim)}` : "DATA A DEFINIR" },
    { label: "EQUIPES:", value: edicao?.limiteEquipes ? `ATÉ ${edicao.limiteEquipes}` : "15 - 25" },
    { label: "EQUIPE:", value: edicao ? `${edicao.limiteMinIntegrantes} - ${edicao.limiteMaxIntegrantes}` : "03 - 05" },
  ];

  return (
    <aside className="relative z-10 flex h-full flex-col border-l border-accent/15 pl-5 font-mono">
      <p className="mb-10 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">
        {"// HACKIF.SYSTEM"}
      </p>

      <dl className="flex flex-col gap-8">
        {systemItems.map((item) => (
          <div key={item.label}>
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-accent">
              {item.label}
            </dt>
            <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.04em] text-foreground/78">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex items-start gap-3 pt-4 text-[0.72rem] uppercase tracking-[0.08em] text-foreground/65 lg:mt-auto">
        <Crosshair
          size={16}
          className="mt-0.5 text-accent"
          aria-hidden="true"
        />
        <div className="space-y-2">
          <p>
            <span className="text-accent"></span> -25.42421° S
          </p>
          <p>
            <span className="text-accent"></span> -49.16315° W
          </p>
        </div>
      </div>
    </aside>
  );
}
