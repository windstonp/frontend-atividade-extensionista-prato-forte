"use client";

import { useNaTela } from "@/lib/motion";

/** Mostra o bloco quando ele entra na tela. Usado nas telas longas. */
export function Reveal({
  atraso = 0,
  className = "",
  children,
}: {
  atraso?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { alvo, visivel } = useNaTela<HTMLDivElement>();

  return (
    <div
      ref={alvo}
      className={`transition-[opacity,transform] duration-[550ms] ease-[cubic-bezier(.22,1,.36,1)] ${
        visivel ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${atraso}ms` }}
    >
      {children}
    </div>
  );
}
