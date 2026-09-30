"use client";

import { useEffect, useRef, useState } from "react";
import { IconeMais, IconeMenos } from "@/components/icons";
import { CountUp } from "@/components/ui/CountUp";
import { cascata } from "@/lib/motion";
import { type Medidas, METRICO } from "@/lib/units";
import { ajustarPeso, lerPesoDigitado, posicaoNaRegua } from "../regras";

const botao =
  "flex size-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-linha bg-white transition-[border-color,background-color,transform] duration-250 hover:border-tinta hover:bg-papel active:scale-90";

/**
 * −/+ um passo (100 g ou 0,2 lb), número que vira campo ao tocar e régua em volta da última pesagem (RF23).
 * `valor` e `base` sempre em kg; a tela mostra e recebe na unidade da pessoa (RN39).
 */
export function WeightStepper({
  valor,
  base,
  aoMudar,
  medidas: m = METRICO,
}: {
  valor: number;
  base: number;
  aoMudar: (v: number) => void;
  medidas?: Medidas;
}) {
  const [digitando, setDigitando] = useState(false);
  const [texto, setTexto] = useState("");
  const numero = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef(false);
  const umaCasa = (n: number) => n.toFixed(1).replace(".", ",");

  // Enter/Escape devolvem o foco ao número (quem usa teclado não se perde); clicar fora não.
  useEffect(() => {
    if (!digitando && devolverFoco.current) {
      devolverFoco.current = false;
      numero.current?.focus();
    }
  }, [digitando]);

  function sair(salvar: boolean, foco: boolean) {
    if (salvar) aoMudar(lerPesoDigitado(texto, valor, m));
    devolverFoco.current = foco;
    setDigitando(false);
  }

  return (
    <>
      <div className="flex items-center justify-center gap-5">
        <button type="button" aria-label={`Diminuir ${m.rotuloPasso}`} onClick={() => aoMudar(ajustarPeso(valor, -1, m))} className={botao}>
          <IconeMenos size={20} />
        </button>
        {digitando ? (
          <input
            autoFocus
            inputMode="decimal"
            aria-label={m.sistema === "imperial" ? "Peso em libras" : "Peso em quilos"}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onFocus={(e) => e.currentTarget.select()} // digitar por cima troca o número inteiro
            onBlur={() => sair(true, false)}
            onKeyDown={(e) => {
              // preventDefault: o mesmo Enter não pode "clicar" o número que recebe o foco e reabrir o campo.
              if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                sair(e.key === "Enter", true);
              }
            }}
            className="w-[150px] rounded-2xl border border-tinta bg-white text-center font-display text-[48px] leading-none font-bold tracking-[-0.04em] tabular-nums focus:outline-none"
          />
        ) : (
          <button
            ref={numero}
            type="button"
            aria-label={`Digitar o peso: ${m.peso(valor)}`}
            onClick={() => {
              setTexto(m.numero(valor));
              setDigitando(true);
            }}
            className="rounded-2xl px-1 font-display text-[58px] leading-none font-bold tracking-[-0.04em] tabular-nums"
          >
            <span aria-live="polite">
              <CountUp valor={m.exibir(valor)} casas={1} duracao={420} />
            </span>{" "}
            <span className="text-xl font-semibold tracking-normal text-fumo">{m.unidadePeso}</span>
          </button>
        )}
        <button type="button" aria-label={`Aumentar ${m.rotuloPasso}`} onClick={() => aoMudar(ajustarPeso(valor, 1, m))} className={botao}>
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
          style={{ left: `${posicaoNaRegua(m.exibir(valor), m.exibir(base), m.regua)}%` }}
        />
        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10.5px] text-fumo">
          <span>{umaCasa(m.exibir(base) - m.regua)}</span>
          <span>{umaCasa(m.exibir(base))}</span>
          <span>{umaCasa(m.exibir(base) + m.regua)}</span>
        </div>
      </div>
    </>
  );
}
