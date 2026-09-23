"use client";

import { useContagem } from "@/lib/motion";

export function CountUp({
  valor,
  casas = 0,
  duracao = 900,
  className,
}: {
  valor: number;
  casas?: number;
  duracao?: number;
  className?: string;
}) {
  const atual = useContagem(valor, duracao, casas);
  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {atual.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      })}
    </span>
  );
}
