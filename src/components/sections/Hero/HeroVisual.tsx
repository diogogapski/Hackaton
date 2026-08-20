"use client";

import { motion } from "framer-motion";

export function HeroVisual() {
  return (
    <motion.div
      className="relative z-0 mx-auto flex h-[320px] w-full max-w-[620px] items-center justify-center overflow-hidden md:h-[380px] lg:-mx-10 lg:h-[430px]"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.18, ease: "easeOut" }}
      aria-label="Área reservada para visual 3D do símbolo IF"
    >
      <div className="absolute inset-x-[8%] top-[8%] h-[72%] bg-[radial-gradient(circle_at_center,rgba(182,255,0,0.16),rgba(182,255,0,0.045)_38%,transparent_68%)]" />
      <div className="absolute inset-x-[16%] bottom-[18%] h-[34%] rounded-[50%] border border-accent/22" />
      <div className="absolute inset-x-[22%] bottom-[22%] h-[24%] rounded-[50%] border border-accent/18" />
      <div className="absolute inset-x-[31%] bottom-[27%] h-[14%] rounded-[50%] border border-accent/16" />
      <div className="absolute bottom-[31%] h-px w-[78%] bg-accent/18" />
      <div className="absolute bottom-[18%] h-px w-[52%] bg-foreground/10" />
      <div className="absolute inset-y-[18%] left-1/2 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      <div className="absolute inset-y-[28%] left-[32%] w-px bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
      <div className="absolute inset-y-[28%] right-[32%] w-px bg-gradient-to-b from-transparent via-accent/10 to-transparent" />

      <div className="relative flex h-[70%] w-[76%] items-center justify-center">
        {/* TODO: substituir pelo IF 3D / vídeo final */}
        <div className="h-[62%] w-[68%] border border-dashed border-accent/18 bg-background/10" />
      </div>
    </motion.div>
  );
}
