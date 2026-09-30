"use client";

import { useState } from "react";
import { IconeMais, IconeMenos } from "@/components/icons";
import { CountUp } from "@/components/ui/CountUp";
import { peso } from "@/lib/format";
import { cascata } from "@/lib/motion";
import { ajustarPeso, lerPesoDigitado, posicaoNaRegua } from "../regras";

const botao =
  "flex size-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-linha bg-white transition-[border-color,background-color,transform] duration-250 hover:border-tinta hover:bg-papel active:scale-90";

/** −/+ de 100 g, número que vira campo ao tocar e régua de ±1 kg em volta da última pesagem (RF23). */
export function WeightStepper({ valor, base, aoMudar }: { valor: number; base: number; aoMudar: (v: number) => void }) {
  const [digitando, setDigitando] = useState(false);
  const [texto, setTexto] = useState("");
  const umaCasa = (n: number) => n.toFixed(1).replace(".", ",");

  function confirmar() {
    aoMudar(lerPesoDigitado(texto, valor));
    setDigitando(false);
  }

  return (
    <>
      <div className="flex items-center justify-center gap-5">
        <button type="button" aria-label="Diminuir 100 gramas" onClick={() => aoMudar(ajustarPeso(valor, -0.1))} className={botao}>
          <IconeMenos size={20} />
        </button>
        {digitando ? (
          <input
            autoFocus
            inputMode="decimal"
            aria-label="Peso em quilos"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={confirmar}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmar();
              if (e.key === "Escape") setDigitando(false);
            }}
            className="w-[150px] rounded-2xl border border-tinta bg-white text-center font-display text-[48px] leading-none font-bold tracking-[-0.04em] tabular-nums focus:outline-none"
          />
        ) : (
          <button
            type="button"
            aria-label={`Digitar o peso: ${peso(valor)}`}
            onClick={() => {
              setTexto(umaCasa(valor));
              setDigitando(true);
            }}
            className="rounded-2xl px-1 font-display text-[58px] leading-none font-bold tracking-[-0.04em] tabular-nums"
          >
            <span aria-live="polite">
              <CountUp valor={valor} casas={1} duracao={420} />
            </span>{" "}
            <span className="text-xl font-semibold tracking-normal text-fumo">kg</span>
          </button>
        )}
        <button type="button" aria-label="Aumentar 100 gramas" onClick={() => aoMudar(ajustarPeso(valor, 0.1))} className={botao}>
          <IconeMais size={20} />
        </button>
      </div>

      <div className="relative mt-[18px] h-[38px]" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-3 flex items-end justify-between">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className={`block w-px origin-bottom animate-entra ${i % 2 ? "h-4 bg-salvia" : "h-2.5 bg-linha"}`} style={cascata(i, 28, 260)} />
          ))}
        </div>
        <span
          data-marcador
          className="absolute bottom-1.5 block h-7 w-[3px] -translate-x-1/2 rounded-sm bg-gema transition-[left] duration-400 ease-[cubic-bezier(.34,1.56,.64,1)]"
          style={{ left: `${posicaoNaRegua(valor, base)}%` }}
        />
        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10.5px] text-fumo">
          <span>{umaCasa(base - 1)}</span>
          <span>{umaCasa(base)}</span>
          <span>{umaCasa(base + 1)}</span>
        </div>
      </div>
    </>
  );
}
