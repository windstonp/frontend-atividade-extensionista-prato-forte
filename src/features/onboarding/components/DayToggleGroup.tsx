"use client";

import { cascata } from "@/lib/motion";

const DIAS = [
  { n: 0, letra: "D", nome: "domingo" },
  { n: 1, letra: "S", nome: "segunda" },
  { n: 2, letra: "T", nome: "terça" },
  { n: 3, letra: "Q", nome: "quarta" },
  { n: 4, letra: "Q", nome: "quinta" },
  { n: 5, letra: "S", nome: "sexta" },
  { n: 6, letra: "S", nome: "sábado" },
];

/** Dias de treino da semana (0 = domingo). */
export function DayToggleGroup({ dias, aoMudar }: { dias: number[]; aoMudar: (dias: number[]) => void }) {
  return (
    <div className="mt-5">
      <span className="mb-2.5 block text-[12.5px] font-semibold text-fumo">Dias de treino</span>
      <div className="flex justify-between">
        {DIAS.map((dia, i) => {
          const marcado = dias.includes(dia.n);
          return (
            <button
              key={dia.n}
              type="button"
              style={cascata(i, 45, 420)}
              aria-pressed={marcado}
              aria-label={dia.nome}
              onClick={() => aoMudar(marcado ? dias.filter((d) => d !== dia.n) : [...dias, dia.n])}
              className={`flex size-10 animate-pop items-center justify-center rounded-full border text-sm font-semibold transition-[background-color,color,border-color,transform] duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-90 ${
                marcado ? "scale-105 border-tinta bg-tinta text-white" : "border-linha bg-white text-tinta hover:border-pedra"
              }`}
            >
              {dia.letra}
            </button>
          );
        })}
      </div>
    </div>
  );
}
