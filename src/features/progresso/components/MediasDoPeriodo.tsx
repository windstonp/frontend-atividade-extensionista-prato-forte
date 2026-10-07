import { Rail } from "@/components/ui/Rail";
import type { Medias } from "../tipos";

/** "Média por dia neste período" (RF25, RN37). */
export function MediasDoPeriodo({ medias }: { medias: Medias }) {
  const { protein, calories } = medias;
  return (
    <section>
      <h2 className="mb-2.5 font-display text-[15px] font-semibold">Média por dia neste período</h2>
      {medias.daysCounted === 0 || protein.avgG === null || calories.avgKcal === null ? (
        <p className="animate-entra rounded-[20px] bg-white px-[18px] py-4 text-[13.5px] leading-snug text-fumo">Marque suas refeições para ver suas médias aqui.</p>
      ) : (
        <>
          <Rail rotulo="Proteína" valor={protein.avgG} meta={protein.targetG ?? protein.avgG} atraso={200} />
          <Rail rotulo="Calorias" valor={calories.avgKcal} meta={calories.targetKcal ?? calories.avgKcal} unidade="kcal" cor="bg-gema" atraso={280} />
          {medias.insight ? <p className="mt-2 text-[12.5px] leading-snug text-fumo">{medias.insight}</p> : null}
        </>
      )}
    </section>
  );
}
