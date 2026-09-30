import { cascata } from "@/lib/motion";
import { rotuloDoDia } from "../regras";
import type { Constancia, StatusDia } from "../tipos";

const CORES: Record<StatusDia, string> = { completo: "bg-mata", parcial: "bg-mata-media", vazio: "bg-linha", hoje: "bg-gema" };

/** Constância dos últimos 28 dias (RF25, RN36). */
export function AdherenceGrid({ constancia }: { constancia: Constancia }) {
  return (
    <section className="rounded-[20px] bg-white px-[18px] py-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[15px] font-semibold">Constância</h2>
        <span className="text-[12.5px] text-fumo">últimos 28 dias</span>
      </div>
      <p className="mt-2 text-[13.5px] leading-snug">
        <b className="font-semibold">{constancia.completeDays} dias</b> com todas as refeições feitas.
        {constancia.streak > 1 ? ` Sua sequência atual é de ${constancia.streak} dias.` : ""}
      </p>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {constancia.days.map((dia, i) => (
          <span
            key={dia.date}
            role="img"
            aria-label={rotuloDoDia(dia)}
            title={rotuloDoDia(dia)}
            style={cascata(i, 16, 120)}
            className={`aspect-square rounded-lg ${CORES[dia.status]} ${dia.status === "hoje" ? "animate-respira" : "animate-pop"}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3.5" aria-hidden="true">
        {[
          { cor: "bg-mata", rotulo: "Dia completo" },
          { cor: "bg-mata-media", rotulo: "Parte das refeições" },
          { cor: "bg-gema", rotulo: "Hoje" },
        ].map((l) => (
          <span key={l.rotulo} className="flex items-center gap-1.5 text-[11.5px] text-fumo">
            <span className={`size-2.5 rounded-[3px] ${l.cor}`} />
            {l.rotulo}
          </span>
        ))}
      </div>
    </section>
  );
}
