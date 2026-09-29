import Link from "next/link";
import { ReguaPeso } from "@/components/ui/Rail";
import type { OrigemDaMeta } from "@/features/onboarding/tipos";
import { peso } from "@/lib/format";
import type { Goal } from "@/lib/types";

/** Cartão do objetivo no Perfil (S17). Sem meta (disposição, CA05), a régua some. */
export function GoalCard({
  objetivo,
  rotuloObjetivo,
  inicioKg,
  atualKg,
  metaKg,
  origemMeta,
  rotuloAtividade,
  academia,
  cidade,
}: {
  objetivo: Goal;
  rotuloObjetivo: string;
  inicioKg: number;
  atualKg: number;
  metaKg: number | null;
  origemMeta: OrigemDaMeta | null;
  rotuloAtividade: string;
  academia: string;
  cidade: string;
}) {
  const comRegua = objetivo !== "mais-disposicao" && metaKg !== null;

  return (
    <section className="animate-escala rounded-[22px] bg-tinta p-[18px] text-neve" style={{ animationDelay: "180ms" }}>
      <p className="text-[12.5px] text-musgo">Seu objetivo</p>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.025em]">{rotuloObjetivo}</h2>
      {comRegua ? (
        <>
          <div className="mt-3.5 flex">
            <ReguaPeso escuro inicio={inicioKg} atual={atualKg} meta={metaKg} />
          </div>
          <div className="mt-2 flex justify-between text-[12.5px]">
            <span className="text-salvia">{peso(atualKg)} hoje</span>
            <span className="text-musgo">
              {origemMeta === "suggested" ? "meta sugerida" : "meta"} {peso(metaKg)}
            </span>
          </div>
        </>
      ) : null}
      <Link
        href="/onboarding/objetivo?editar=1"
        className="mt-4 flex h-[42px] items-center justify-center rounded-full border-[1.5px] border-grafite text-sm font-semibold text-neve transition hover:bg-neve/10"
      >
        Trocar objetivo
      </Link>
      <p className="mt-3 text-[12.5px] text-musgo">
        {rotuloAtividade}, na {academia} de {cidade}
      </p>
    </section>
  );
}
