"use client";

import { porcentagem } from "@/lib/format";
import { useMontado } from "@/lib/motion";
import { CountUp } from "@/components/ui/CountUp";

/** A régua: barra fina que enche até a meta assim que a tela abre. */
export function Rail({
  rotulo,
  valor,
  meta,
  unidade = "g",
  cor = "bg-tinta",
  fundo = "bg-linha",
  atraso = 0,
}: {
  rotulo: string;
  valor: number;
  /** Sem meta: a barra fica cheia e só o valor aparece (nada de "92/92 g"). */
  meta?: number;
  unidade?: string;
  cor?: string;
  fundo?: string;
  atraso?: number;
}) {
  const montado = useMontado(atraso);

  return (
    <div className="flex h-7 items-center gap-3">
      <span className="w-[74px] shrink-0 text-[12.5px] text-fumo">{rotulo}</span>
      <span className={`relative h-1.5 flex-1 overflow-hidden rounded-full ${fundo}`}>
        <span
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] ${cor}`}
          style={{ width: montado ? `${meta === undefined ? 100 : porcentagem(valor, meta)}%` : "0%" }}
        />
      </span>
      <span className="w-[68px] shrink-0 text-right text-[12.5px] font-semibold tabular-nums">
        <CountUp valor={Math.round(valor)} duracao={900} />
        {meta === undefined ? "" : `/${Math.round(meta)}`} {unidade}
      </span>
    </div>
  );
}

/** Versão sem meta escrita, usada dentro do detalhe da refeição. */
export function RailSimples({
  rotulo,
  valor,
  proporcao,
  cor,
  atraso = 0,
}: {
  rotulo: string;
  valor: string;
  proporcao: number;
  cor: string;
  atraso?: number;
}) {
  const montado = useMontado(atraso);

  return (
    <div className="flex h-7 items-center gap-3">
      <span className="w-[74px] shrink-0 text-[12.5px] text-fumo">{rotulo}</span>
      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-papel">
        <span
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] ${cor}`}
          style={{ width: montado ? `${Math.min(100, proporcao)}%` : "0%" }}
        />
      </span>
      <span className="w-12 shrink-0 text-right text-[12.5px] font-semibold tabular-nums">
        {valor}
      </span>
    </div>
  );
}

/** Régua do peso: o marcador desliza até a posição atual. */
export function ReguaPeso({
  inicio,
  atual,
  meta,
  escuro = false,
  atraso = 260,
}: {
  inicio: number;
  atual: number;
  meta: number;
  escuro?: boolean;
  atraso?: number;
}) {
  const montado = useMontado(atraso);
  // Manter o peso: início = meta; a régua fica cheia em vez de dividir por zero.
  const distancia = meta - inicio;
  const pos = distancia === 0 ? 100 : Math.min(100, Math.max(0, ((atual - inicio) / distancia) * 100));
  const larguraAtual = montado ? pos : 0;

  return (
    <span className="relative block h-4 flex-1">
      <span
        className={`absolute inset-x-0 top-[7px] block h-0.5 rounded-full ${
          escuro ? "bg-breu" : "bg-linha"
        }`}
      />
      <span
        className="absolute top-[7px] left-0 block h-0.5 rounded-full bg-gema transition-[width] duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)]"
        style={{ width: `${larguraAtual}%` }}
      />
      <span
        className="absolute top-0.5 block h-3 w-[3px] -translate-x-1/2 rounded-sm bg-gema transition-[left] duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)]"
        style={{ left: `${larguraAtual}%` }}
      />
    </span>
  );
}
