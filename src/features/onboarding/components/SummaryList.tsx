import Link from "next/link";
import { cascata } from "@/lib/motion";
import type { LinhaDoResumo } from "../resumo";

/** Linhas do resumo, cada uma com "Editar" que volta ao resumo depois de salvar. */
export function SummaryList({ linhas }: { linhas: LinhaDoResumo[] }) {
  return (
    <div className="rounded-[18px] bg-white px-4">
      {linhas.map((linha, i) => (
        <div
          key={linha.etapa}
          style={cascata(i, 60, 180)}
          className={`flex min-h-[62px] animate-entra items-center gap-3 py-3 ${i < linhas.length - 1 ? "border-b border-fio" : ""}`}
        >
          <div className="flex-1">
            <span className="block text-[12.5px] text-fumo">{linha.rotulo}</span>
            <span className={`mt-0.5 block text-[15px] font-semibold ${linha.alerta ? "text-alerta" : ""}`}>{linha.valor}</span>
          </div>
          <Link
            href={`/onboarding/${linha.etapa}?de=resumo`}
            className="shrink-0 py-2 pl-3 text-[13px] font-semibold text-mata hover:text-tinta"
          >
            Editar
            <span className="sr-only"> {linha.rotulo.toLowerCase()}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
