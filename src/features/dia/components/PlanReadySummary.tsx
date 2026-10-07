import { kcal } from "@/lib/format";
import { cascata } from "@/lib/motion";
import type { RefeicaoDoPlano } from "../tipos";
import { MacroSummary } from "./MacroSummary";

/** "Um dia comum": as refeições do plano novo com horário e kcal, e os macros do dia. */
export function PlanReadySummary({
  refeicoes,
  metas,
}: {
  refeicoes: Pick<RefeicaoDoPlano, "slot" | "time" | "name" | "calories">[];
  metas: { kcal: number; proteinG: number; carbsG: number; fatG: number };
}) {
  return (
    <section className="mt-[22px] animate-escala rounded-[20px] bg-white px-[18px] pt-1.5 pb-3.5" style={{ animationDelay: "340ms" }}>
      <div className="flex items-baseline justify-between py-3.5">
        <h2 className="font-display text-[15px] font-semibold">Um dia comum</h2>
        <span className="text-[12.5px] text-fumo">{kcal(metas.kcal)}</span>
      </div>
      {refeicoes.map((meal, i) => (
        <div
          key={meal.slot}
          style={cascata(i, 70, 460)}
          className={`flex min-h-[52px] animate-entra-lado-esq items-center gap-3 ${i < refeicoes.length - 1 ? "border-b border-fio" : ""}`}
        >
          <span className="w-[46px] text-[12.5px] text-fumo">{meal.time}</span>
          <span className="flex-1 text-[14.5px] font-medium">{meal.name}</span>
          <span className="text-[12.5px] text-fumo">{kcal(meal.calories)}</span>
        </div>
      ))}
      <MacroSummary proteinG={metas.proteinG} carbsG={metas.carbsG} fatG={metas.fatG} />
    </section>
  );
}
