"use client";

import { useId } from "react";

/** Interruptor (`role="switch"`), com a descrição lida junto do rótulo. */
export function Toggle({
  ligado,
  onChange,
  rotulo,
  descricao,
  desabilitado = false,
}: {
  ligado: boolean;
  onChange: (v: boolean) => void;
  rotulo: string;
  descricao?: string;
  desabilitado?: boolean;
}) {
  const idDescricao = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      aria-describedby={descricao ? idDescricao : undefined}
      disabled={desabilitado}
      onClick={() => onChange(!ligado)}
      className="flex min-h-[62px] w-full items-center gap-3.5 py-3 text-left active:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex-1">
        <span className="block text-[15px] font-semibold">{rotulo}</span>
        {descricao ? (
          <span id={idDescricao} className="mt-0.5 block text-[13px] text-fumo">
            {descricao}
          </span>
        ) : null}
      </span>
      <span className={`relative h-7 w-[46px] shrink-0 rounded-full transition-colors duration-300 ${ligado ? "bg-mata" : "bg-[#cfd6cc]"}`}>
        <span
          className={`absolute top-[3px] left-[3px] size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(21,37,28,.25)] transition-[transform,width] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${
            ligado ? "translate-x-[18px]" : ""
          }`}
        />
      </span>
    </button>
  );
}
