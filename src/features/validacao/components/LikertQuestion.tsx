"use client";

import { useRef } from "react";
import { OptionRow } from "@/components/ui/OptionRow";
import { cascata } from "@/lib/motion";

/** Escala de 5 pontos como grupo de rádio: setas trocam a escolha (WAI-ARIA). Valores 1…n. */
export function LikertQuestion({ rotulo, opcoes, valor, aoEscolher }: { rotulo: string; opcoes: string[]; valor: number | null; aoEscolher: (n: number) => void }) {
  const grupo = useRef<HTMLDivElement>(null);

  function mover(evento: React.KeyboardEvent) {
    const passo = evento.key === "ArrowDown" || evento.key === "ArrowRight" ? 1 : evento.key === "ArrowUp" || evento.key === "ArrowLeft" ? -1 : 0;
    if (passo === 0) return;
    evento.preventDefault();
    const proximo = Math.min(opcoes.length, Math.max(1, (valor ?? 0) + passo));
    aoEscolher(proximo);
    grupo.current?.querySelectorAll<HTMLElement>('[role="radio"]')[proximo - 1]?.focus();
  }

  return (
    <div ref={grupo} role="radiogroup" aria-label={rotulo} onKeyDown={mover} className="flex flex-col gap-2">
      {opcoes.map((opcao, i) => (
        <OptionRow key={opcao} marcado={valor === i + 1} onClick={() => aoEscolher(i + 1)} titulo={opcao} compacto className="animate-entra" style={cascata(i, 50, 160)} />
      ))}
    </div>
  );
}
