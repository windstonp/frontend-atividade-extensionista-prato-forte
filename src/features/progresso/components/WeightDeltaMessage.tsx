import type { Goal } from "@/lib/types";
import { type Medidas, METRICO } from "@/lib/units";
import { mensagemDaDiferenca } from "../regras";

/** Comparação com a última pesagem, com a leitura certa para cada objetivo. */
export function WeightDeltaMessage({
  objetivo,
  diferencaKg,
  diasDesdeUltima,
  medidas: m = METRICO,
}: {
  objetivo: Goal;
  diferencaKg: number;
  diasDesdeUltima: number;
  medidas?: Medidas;
}) {
  return <p className="mt-3.5 border-t border-fio pt-3.5 text-[13px] leading-normal text-fumo">{mensagemDaDiferenca(objetivo, diferencaKg, diasDesdeUltima, m)}</p>;
}
