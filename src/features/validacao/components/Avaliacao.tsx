"use client";

import { useAvaliacao } from "../hooks";
import type { Alvo, Avaliacao as Valor } from "../tipos";
import { RatingButtons } from "./RatingButtons";

/** Liga os botões à API; o valor inicial vem da API (`rating`). */
export function Avaliacao({ alvo, inicial, variante }: { alvo: Alvo; inicial: Valor | null; variante: "resposta" | "plano" }) {
  const { valor, salvando, marcar, comentar } = useAvaliacao(alvo, inicial);
  return <RatingButtons variante={variante} valor={valor} salvando={salvando} aoMarcar={marcar} aoComentar={comentar} />;
}
