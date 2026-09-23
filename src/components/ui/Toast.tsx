"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!aoExpirar) return;
    setSaindo(false);
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
      className={`relative mx-5 flex shrink-0 items-center gap-3 overflow-hidden rounded-2xl bg-tinta px-3.5 py-3 text-neve shadow-[0_1px_2px_rgba(21,37,28,.06),0_12px_30px_-14px_rgba(21,37,28,.45)] transition-[opacity,transform] duration-250 ease-[cubic-bezier(.22,1,.36,1)] ${
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
          onClick={acao.onClick}
          className="shrink-0 py-1.5 pl-1.5 text-[13px] font-semibold text-gema transition-colors hover:text-white"
        >
          {acao.rotulo}
        </button>
      ) : null}
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
