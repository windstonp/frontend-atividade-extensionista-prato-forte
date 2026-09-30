"use client";

import { useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { useDesfazer } from "../hooks";
import type { Dia } from "../tipos";

/** Alterações cujo aviso já sumiu: voltar à tela não mostra de novo (a API guarda por 15 min). */
const dispensadas = new Set<number>();

/** Toast da última alteração do dia, com "Desfazer" (RF15). */
export function AvisoDeAlteracao({ alteracao }: { alteracao: Dia["lastChange"] }) {
  const desfazer = useDesfazer();
  const [, redesenhar] = useState(0);

  if (!alteracao || dispensadas.has(alteracao.id)) return null;
  const dispensar = () => {
    dispensadas.add(alteracao.id);
    redesenhar((n) => n + 1);
  };

  return (
    <Toast
      key={alteracao.id}
      texto={alteracao.text}
      acao={{
        rotulo: "Desfazer",
        onClick: () => {
          dispensar();
          desfazer.mutate();
        },
      }}
      aoExpirar={dispensar}
    />
  );
}
