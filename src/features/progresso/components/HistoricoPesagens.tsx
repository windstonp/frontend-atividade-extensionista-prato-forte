import { dataPorExtenso } from "@/lib/format";
import { type Medidas, METRICO } from "@/lib/units";
import { cascata } from "@/lib/motion";
import { historico } from "../regras";
import type { Pesagem } from "../tipos";

/** "Suas pesagens": as 4 últimas com a diferença em gramas. */
export function HistoricoPesagens({ pesagens, medidas: m = METRICO }: { pesagens: Pesagem[]; medidas?: Medidas }) {
  const lista = historico(pesagens);
  if (lista.length === 0) return null;
  return (
    <ul className="mt-2.5 list-none rounded-[20px] bg-white px-[18px]">
      {lista.map((p, i) => (
        <li
          key={p.date}
          style={cascata(i, 60, 360)}
          className={`flex animate-entra-lado-esq items-center gap-3 py-[13px] ${i < lista.length - 1 ? "border-b border-fio" : ""}`}
        >
          <span className="flex-1 text-sm">{dataPorExtenso(p.date).split(", ")[1]}</span>
          <span className="w-16 text-right text-sm font-semibold tabular-nums">{m.peso(p.weightKg)}</span>
          <span className={`w-14 text-right text-[12.5px] font-semibold ${p.deltaG !== null && p.deltaG >= 0 ? "text-mata" : "text-fumo"}`}>
            {p.deltaG === null ? "início" : `${p.deltaG >= 0 ? "+" : "−"}${m.diferenca(p.deltaG / 1000)}`}
          </span>
        </li>
      ))}
    </ul>
  );
}
