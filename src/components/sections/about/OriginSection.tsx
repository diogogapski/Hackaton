"use client";
import { motion } from "framer-motion";
const questions = ["COMO TRANSFORMAR CONHECIMENTO EM EXPERIÊNCIA?", "COMO APRENDER COM PROBLEMAS SEM RESPOSTAS PRONTAS?", "COMO TRANSFORMAR UMA IDEIA EM ALGO REAL?"];
export function OriginSection() {
  return <section className="border-t border-foreground/10 bg-background py-32 lg:py-48"><div className="mx-auto max-w-[1440px] px-6 md:px-10"><p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55"><span className="text-accent">02 //</span> POR QUE EXISTE</p><div className="mt-16 max-w-[900px]">{questions.map((question, index) => <motion.p key={question} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="border-b border-foreground/10 py-10 font-display text-[clamp(2rem,5vw,5.5rem)] font-semibold uppercase leading-[1.02] text-foreground">{question}</motion.p>)}<p className="pt-12 font-display text-[clamp(2.5rem,7vw,7rem)] font-semibold uppercase leading-none text-accent">HACKIF._</p></div></div></section>;
}
