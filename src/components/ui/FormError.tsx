"use client";

import { useEffect, useRef } from "react";
import { IconeSemConexao } from "@/components/icons";
import type { ApiError } from "@/lib/api/errors";

/** Erro geral de formulário (rede, 500, credenciais, limite), acima do botão. */
export function FormError({
  erro,
  aoTentarDeNovo,
  focar = true,
}: {
  erro: ApiError | string | null;
  aoTentarDeNovo?: () => void;
  focar?: boolean;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const texto = erro === null ? null : typeof erro === "string" ? erro : erro.message;

  useEffect(() => {
    if (texto && focar) caixa.current?.focus();
  }, [texto, focar]);

  if (!texto) return null;

  return (
    <div
      ref={caixa}
      role="alert"
      tabIndex={-1}
      className="mb-3 flex animate-balanca items-start gap-2.5 rounded-2xl bg-alerta-fraca px-4 py-3 outline-none"
    >
      <IconeSemConexao size={18} className="mt-px shrink-0 text-alerta" />
      <div className="flex-1">
        <p className="text-[13.5px] leading-snug font-medium text-alerta-texto">{texto}</p>
        {aoTentarDeNovo ? (
          <button
            type="button"
            onClick={aoTentarDeNovo}
            className="mt-1.5 text-[13px] font-semibold text-alerta-texto underline underline-offset-2"
          >
            Tentar de novo
          </button>
        ) : null}
      </div>
    </div>
  );
}
