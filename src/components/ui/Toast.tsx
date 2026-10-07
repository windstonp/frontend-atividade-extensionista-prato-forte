"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconeCheck } from "@/components/icons";

export function Toast({
  texto,
  acao,
  aoExpirar,
  segundos = 7,
}: {
  texto: string;
  acao?: { rotulo: string; onClick: () => void };
  aoExpirar?: () => void;
  segundos?: number;
}) {
  const [saindo, setSaindo] = useState(false);
  // Texto novo no mesmo toast: volta a aparecer inteiro.
  const [textoVisto, setTextoVisto] = useState(texto);
  if (textoVisto !== texto) {
    setTextoVisto(texto);
    setSaindo(false);
  }

  // Fechar na mão (toque no aviso ou no "×"): sai com a mesma animação e avisa quem abriu.
  const saida = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fechar = useCallback(() => {
    if (saida.current) return;
    setSaindo(true);
    saida.current = setTimeout(() => aoExpirar?.(), 260);
  }, [aoExpirar]);
  useEffect(() => () => {
    if (saida.current) clearTimeout(saida.current);
  }, []);

  useEffect(() => {
    if (!aoExpirar) return;
    const some = setTimeout(() => setSaindo(true), segundos * 1000);
    const tira = setTimeout(() => aoExpirar(), segundos * 1000 + 260);
    return () => {
      clearTimeout(some);
      clearTimeout(tira);
    };
  }, [texto, aoExpirar, segundos]);

  return (
    <div
      role="status"
      onClick={fechar}
      className={`relative mx-5 flex cursor-pointer shrink-0 items-center gap-3 overflow-hidden rounded-2xl bg-tinta px-3.5 py-3 text-neve shadow-[0_1px_2px_rgba(21,37,28,.06),0_12px_30px_-14px_rgba(21,37,28,.45)] transition-[opacity,transform] duration-250 ease-[cubic-bezier(.22,1,.36,1)] ${
        saindo ? "-translate-y-2 opacity-0" : "animate-entra-topo"
      }`}
    >
      <span className="flex size-[22px] shrink-0 animate-pop items-center justify-center rounded-full bg-mata text-white">
        <IconeCheck size={12} strokeWidth={2.6} />
      </span>
      <span className="flex-1 text-[13.5px] font-medium">{texto}</span>
      {acao ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            acao.onClick();
            fechar();
          }}
          className="shrink-0 py-1.5 pl-1.5 text-[13px] font-semibold text-gema transition-colors hover:text-white"
        >
          {acao.rotulo}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Fechar aviso"
        onClick={(e) => {
          e.stopPropagation();
          fechar();
        }}
        className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-musgo transition-colors hover:bg-white/10 hover:text-neve"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      {aoExpirar ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gema/40"
          style={{
            animation: `pf-tique ${segundos}s linear reverse both`,
          }}
        />
      ) : null}
    </div>
  );
}
