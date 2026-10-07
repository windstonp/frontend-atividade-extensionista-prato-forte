"use client";

import { useId, useState } from "react";
import type { Avaliacao, ValorAvaliacao } from "../tipos";

const ROTULOS = {
  resposta: { up: "Resposta útil", down: "Resposta não ajudou" },
  plano: { up: "O plano faz sentido", down: "O plano não faz sentido" },
} as const;

function Polegar({ para, cheio }: { para: ValorAvaliacao; cheio: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true" className={para === "down" ? "rotate-180" : ""}>
      <path
        d="M7 10v11H4V10h3Zm2 11h8.2a2 2 0 0 0 2-1.6l1.3-6.6A2 2 0 0 0 18.5 10H14l.7-3.8A2.3 2.3 0 0 0 12.4 3.5L9 10v11Z"
        fill={cheio ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 👍/👎 (RF31). Depois do 👎, pergunta o que não ajudou (opcional). */
export function RatingButtons({
  variante,
  valor,
  salvando = false,
  aoMarcar,
  aoComentar,
}: {
  variante: "resposta" | "plano";
  valor: Avaliacao | null;
  salvando?: boolean;
  aoMarcar: (v: ValorAvaliacao) => void;
  aoComentar: (texto: string) => void;
}) {
  const [comentando, setComentando] = useState(false);
  const [texto, setTexto] = useState("");
  const idCampo = useId();
  const rotulos = ROTULOS[variante];

  function fechar() {
    setComentando(false);
    setTexto(""); // a próxima vez começa em branco
  }

  function marcar(v: ValorAvaliacao) {
    setComentando(v === "down" && valor?.value !== "down");
    aoMarcar(v);
  }

  return (
    <div className="mt-2.5">
      <div className="flex gap-1.5">
        {(["up", "down"] as const).map((v) => {
          const marcado = valor?.value === v;
          return (
            <button
              key={v}
              type="button"
              aria-label={rotulos[v]}
              aria-pressed={marcado}
              aria-busy={salvando || undefined}
              onClick={() => marcar(v)}
              className={`flex size-9 items-center justify-center rounded-full border transition-[background-color,color,border-color,transform] duration-250 active:scale-90 ${
                marcado ? (v === "up" ? "animate-pop border-mata bg-mata text-neve" : "animate-pop border-alerta bg-alerta text-neve") : "border-linha bg-white text-fumo hover:border-pedra"
              }`}
            >
              <Polegar para={v} cheio={marcado} />
            </button>
          );
        })}
      </div>
      {comentando ? (
        <div className="mt-2.5 animate-entra rounded-2xl bg-white p-3">
          <label htmlFor={idCampo} className="text-[13px] font-semibold">
            O que não ajudou?
          </label>
          <textarea
            id={idCampo}
            value={texto}
            maxLength={500}
            onChange={(e) => setTexto(e.target.value)}
            rows={2}
            className="mt-1.5 w-full resize-none rounded-xl border border-linha px-3 py-2 text-[14px] focus:border-tinta focus:outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={fechar} className="h-9 rounded-full px-3.5 text-[13px] font-semibold text-fumo">
              Pular
            </button>
            <button
              type="button"
              disabled={texto.trim() === ""}
              onClick={() => {
                aoComentar(texto);
                fechar();
              }}
              className="h-9 rounded-full bg-tinta px-4 text-[13px] font-semibold text-neve disabled:opacity-40"
            >
              Enviar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
