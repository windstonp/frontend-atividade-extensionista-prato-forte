"use client";

import { useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { useDesfazer } from "../hooks";
import type { Dia } from "../tipos";

const CHAVE = "prato-forte:avisos-dispensados";

/** Lê do navegador os avisos já fechados; sem armazenamento (aba anônima, bloqueado), começa vazio. */
function lerDispensadas(): Set<number> {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "[]") as unknown;
    return new Set(Array.isArray(salvo) ? salvo.filter((n): n is number => typeof n === "number") : []);
  } catch {
    return new Set();
  }
}

/**
 * Alterações cujo aviso já sumiu (expirou, fechou ou desfez): nem voltar à tela nem recarregar (F5)
 * mostra de novo — a API mantém a última alteração desfazível por 15 min. Guarda só as 30 últimas.
 */
const dispensadas = typeof window === "undefined" ? new Set<number>() : lerDispensadas();

function guardar(id: number) {
  dispensadas.add(id);
  try {
    localStorage.setItem(CHAVE, JSON.stringify([...dispensadas].slice(-30)));
  } catch {
    // Sem armazenamento: vale só até recarregar.
  }
}

/** Toast da última alteração do dia, com "Desfazer" (RF15). */
export function AvisoDeAlteracao({ alteracao }: { alteracao: Dia["lastChange"] }) {
  const desfazer = useDesfazer();
  const [, redesenhar] = useState(0);

  if (!alteracao || dispensadas.has(alteracao.id)) return null;
  const dispensar = () => {
    guardar(alteracao.id);
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
