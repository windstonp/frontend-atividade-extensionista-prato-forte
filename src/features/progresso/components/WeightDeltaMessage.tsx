import type { Goal } from "@/lib/types";
import { mensagemDaDiferenca } from "../regras";

/** Comparação com a última pesagem, com a leitura certa para cada objetivo. */
export function WeightDeltaMessage({ objetivo, diferencaKg, diasDesdeUltima }: { objetivo: Goal; diferencaKg: number; diasDesdeUltima: number }) {
  return <p className="mt-3.5 border-t border-fio pt-3.5 text-[13px] leading-normal text-fumo">{mensagemDaDiferenca(objetivo, diferencaKg, diasDesdeUltima)}</p>;
}
