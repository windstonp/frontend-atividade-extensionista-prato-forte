"use client";

import { useRef } from "react";
import { cascata } from "@/lib/motion";

const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const meioDia = (iso: string) => new Date(`${iso}T12:00:00`);

/** Segunda a domingo; setas, Home e End trocam o dia (padrão de abas do WAI-ARIA). */
export function WeekDayPicker({
  dias,
  hoje,
  selecionado,
  aoEscolher,
}: {
  dias: string[];
  hoje: string;
  selecionado: string;
  aoEscolher: (dia: string) => void;
}) {
  const abas = useRef<(HTMLButtonElement | null)[]>([]);

  function escolher(indice: number) {
    const destino = Math.max(0, Math.min(dias.length - 1, indice));
    aoEscolher(dias[destino]);
    abas.current[destino]?.focus();
  }

  function aoTeclar(evento: React.KeyboardEvent, indice: number) {
    const para = { ArrowRight: indice + 1, ArrowLeft: indice - 1, Home: 0, End: dias.length - 1 }[evento.key];
    if (para === undefined) return;
    evento.preventDefault();
    escolher(para);
  }

  return (
    <div className="mt-3.5 flex justify-between" role="tablist" aria-label="Dias da semana">
      {dias.map((dia, i) => {
        const ativo = dia === selecionado;
        const data = meioDia(dia);
        return (
          <button
            key={dia}
            ref={(el) => {
              abas.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={ativo}
            aria-current={dia === hoje ? "date" : undefined}
            tabIndex={ativo ? 0 : -1}
            onClick={() => aoEscolher(dia)}
            onKeyDown={(e) => aoTeclar(e, i)}
            style={cascata(i, 45, 120)}
            className={`relative flex h-14 w-[42px] animate-pop flex-col items-center justify-center gap-[3px] rounded-[14px] border transition-[background-color,color,border-color,transform,box-shadow] duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-90 ${
              ativo
                ? "-translate-y-0.5 border-tinta bg-tinta text-white shadow-[0_10px_20px_-14px_rgba(21,37,28,1)]"
                : "border-linha bg-white text-tinta hover:border-pedra"
            }`}
          >
            <span className="text-[10.5px] font-medium opacity-80">{DIAS_CURTOS[data.getDay()]}</span>
            <span className="text-[15px] font-semibold">{data.getDate()}</span>
            {/* hoje ganha um ponto de gema, mesmo quando outro dia está aberto */}
            <span
              aria-hidden
              className={`absolute bottom-1.5 size-1 rounded-full bg-gema transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${
                dia === hoje && !ativo ? "scale-100" : "scale-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
