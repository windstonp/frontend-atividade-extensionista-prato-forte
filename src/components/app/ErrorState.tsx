"use client";

import { Button } from "@/components/ui/Button";
import { IconeSemConexao } from "@/components/icons";

export function ErrorState({
  titulo,
  descricao,
  aoTentarDeNovo,
}: {
  titulo: string;
  descricao: string;
  aoTentarDeNovo?: () => void;
}) {
  return (
    <div className="px-5 py-10">
      <div className="flex items-start gap-3 rounded-2xl bg-alerta-fraca p-4">
        <IconeSemConexao size={20} className="mt-0.5 shrink-0 text-alerta" />
        <div>
          <p className="text-[14.5px] font-semibold text-alerta-texto">{titulo}</p>
          <p className="mt-1 text-[13px] leading-snug text-alerta-texto">{descricao}</p>
        </div>
      </div>
      {aoTentarDeNovo ? (
        <Button variante="contorno" className="mt-4" onClick={aoTentarDeNovo}>
          Tentar de novo
        </Button>
      ) : null}
    </div>
  );
}
