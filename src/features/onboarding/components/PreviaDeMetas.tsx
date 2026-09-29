import { Skeleton } from "@/components/ui/Skeleton";
import { kcal } from "@/lib/format";
import type { Previa } from "../tipos";

/** RF08 — prévia das metas no resumo. Com erro, some: não impede gerar o plano. */
export function PreviaDeMetas({ estado }: { estado: "carregando" | "indisponivel" | Previa }) {
  if (estado === "indisponivel") return null;

  return (
    <div className="mt-4 animate-escala rounded-[18px] bg-tinta px-[18px] py-4 text-neve" style={{ animationDelay: "560ms" }}>
      {estado === "carregando" ? (
        <div role="status" aria-busy="true" aria-label="Calculando suas metas">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="mt-2 h-4 w-3/5" atraso={90} />
        </div>
      ) : (
        <p className="text-[14.5px] leading-normal text-salvia">
          Com isso, seu plano começa em <span className="font-semibold text-gema">{kcal(estado.kcal)}</span> por dia, com{" "}
          {estado.proteinG} g de proteína divididos em {estado.meals} refeições.
        </p>
      )}
    </div>
  );
}
