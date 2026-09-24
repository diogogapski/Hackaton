"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

/**
 * Campo de senha com botão para mostrar/ocultar o que foi digitado.
 * O rótulo do botão evita a palavra "senha" para não competir com o rótulo do próprio campo.
 */
export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visivel, setVisivel] = useState(false);

  return (
    <span className="relative block">
      <input {...props} type={visivel ? "text" : "password"} className={`${className ?? ""} pr-11`} />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? "Ocultar texto digitado" : "Mostrar texto digitado"}
        aria-pressed={visivel}
        title={visivel ? "Ocultar" : "Mostrar"}
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-foreground/45 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
      >
        {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </span>
  );
}
