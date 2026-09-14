"use client";

import { Clock3, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { DadosHome } from "@/src/server/home/dados";

const doisDigitos = (n: number) => String(n).padStart(2, "0");

export function HeroStats({ dados }: { dados: DadosHome }) {
  const stats = [
    dados?.equipesInscritas
      ? { icon: Users, value: doisDigitos(dados.equipesInscritas), description: "EQUIPES INSCRITAS" }
      : { icon: Users, value: "15–25", description: "EQUIPES ESPERADAS" },
    {
      icon: Users,
      value: dados ? `${doisDigitos(dados.limiteMinIntegrantes)}–${doisDigitos(dados.limiteMaxIntegrantes)}` : "03–05",
      description: "INTEGRANTES POR EQUIPE",
    },
    { icon: Clock3, value: dados ? `${dados.duracaoHoras}H` : "24–48H", description: "DE MUITA INOVAÇÃO" },
    { icon: Trophy, value: "PRÊMIOS", description: "PARA AS MELHORES SOLUÇÕES" },
  ];

  return (
    <motion.div
      className="relative grid border border-foreground/12 bg-background/92 sm:grid-cols-2 lg:grid-cols-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.38, ease: "easeOut" }}
    >
      <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-accent" />
      <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-accent" />
      <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-accent" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-accent" />

      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.description}
            className="flex min-h-[132px] items-center gap-5 border-foreground/10 px-6 py-7 sm:px-8 sm:[&:nth-child(2n+1)]:border-r lg:border-l lg:[&:nth-child(2n+1)]:border-r-0 lg:first:border-l-0"
          >
            <Icon
              size={25}
              strokeWidth={1.7}
              className="shrink-0 text-accent"
              aria-hidden="true"
            />
            <div>
              <p className="font-display text-[clamp(1.55rem,2vw,2.15rem)] font-semibold uppercase leading-[1.12] text-accent">
                {stat.value}
              </p>
              <p className="mt-3 max-w-[170px] font-mono text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.1em] text-foreground/55">
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
