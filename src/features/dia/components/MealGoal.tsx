"use client";

import { CountUp } from "@/components/ui/CountUp";
import { useMontado } from "@/lib/motion";
import { fraseDaMeta, statusDaMeta } from "../registro";
import type { Totais } from "../tipos";

/**
 * A régua da refeição — o elemento memorável da tela (spec 09 S13).
 * Faixa hachurada = 90–110% da meta; o preenchimento cresce com mola a cada registro.
 * Cor: gema abaixo, mata com a meta batida; o que passa de 110% aparece em mata-media, sem tom de erro (RN48).
 */
export function MealGoal({ meta, consumido, temRegistro }: { meta: Totais; consumido: Totais; temRegistro: boolean }) {
  const montado = useMontado(120);
  const frase = fraseDaMeta(meta, consumido, temRegistro);
  const { goalMet } = statusDaMeta(meta, consumido);
  // A régua vai até 130% da meta, para caber o excesso sem estourar a largura.
  const escala = Math.max(meta.calories * 1.3, 1);
  const pct = (n: number) => `${Math.min(100, (n / escala) * 100)}%`;
  const ate110 = Math.min(consumido.calories, meta.calories * 1.1);
  const excesso = Math.max(0, consumido.calories - meta.calories * 1.1);

  return (
    <section className="animate-escala rounded-[24px] bg-white px-[18px] pt-4 pb-[18px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-[40px] leading-none font-bold tracking-[-0.035em]">
          <CountUp valor={consumido.calories} duracao={700} /> <span className="text-[17px] font-semibold tracking-normal text-fumo">kcal</span>
        </p>
        <span className="text-[13px] text-fumo">meta {meta.calories}</span>
      </div>

      <div
        role="meter"
        aria-label="Calorias registradas nesta refeição"
        aria-valuemin={0}
        aria-valuemax={meta.calories}
        aria-valuenow={consumido.calories}
        aria-valuetext={frase}
        className="relative mt-3.5 h-4 overflow-hidden rounded-full bg-fio"
      >
        {/* faixa de acerto: 90% a 110% da meta */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 bg-[repeating-linear-gradient(135deg,var(--color-linha)_0_4px,transparent_4px_8px)]"
          style={{ left: pct(meta.calories * 0.9), width: `calc(${pct(meta.calories * 1.1)} - ${pct(meta.calories * 0.9)})` }}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-[600ms] ease-[cubic-bezier(.34,1.3,.64,1)] motion-reduce:transition-none ${goalMet ? "bg-mata" : "bg-gema"}`}
          style={{ width: montado ? pct(ate110) : "0%" }}
        />
        {excesso > 0 ? (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 bg-mata-media transition-[width] duration-[600ms] motion-reduce:transition-none"
            style={{ left: pct(meta.calories * 1.1), width: montado ? `calc(${pct(consumido.calories)} - ${pct(meta.calories * 1.1)})` : "0%" }}
          />
        ) : null}
      </div>

      <p aria-live="polite" className="mt-2.5 text-[13.5px] font-medium text-tinta">{frase}</p>

      <div className="mt-3 border-t border-fio pt-3">
        <Barra rotulo="Proteína" valor={consumido.protein} meta={meta.protein} cor="bg-tinta" />
        <Barra rotulo="Gordura" valor={consumido.fat} meta={meta.fat} cor="bg-mata" />
        <Barra rotulo="Carboidrato" valor={consumido.carbs} meta={meta.carbs} cor="bg-gema" />
      </div>
    </section>
  );
}

function Barra({ rotulo, valor, meta, cor }: { rotulo: string; valor: number; meta: number; cor: string }) {
  const montado = useMontado(200);
  const proporcao = meta > 0 ? Math.min(1, valor / meta) : 0;
  return (
    <div className="flex h-7 items-center gap-3">
      <span className="w-[86px] shrink-0 text-[12.5px] text-fumo">{rotulo}</span>
      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-fio">
        <span className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-[600ms] motion-reduce:transition-none ${cor}`} style={{ width: montado ? `${proporcao * 100}%` : "0%" }} />
      </span>
      <span className="w-[86px] shrink-0 text-right text-[12.5px] font-semibold tabular-nums whitespace-nowrap">
        {Math.round(valor)} / {Math.round(meta)} g
      </span>
    </div>
  );
}
