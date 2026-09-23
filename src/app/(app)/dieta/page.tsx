"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/app/BottomNav";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconeCheck, MarcaNutri } from "@/components/icons";
import { kcal } from "@/lib/format";
import { totaisDaRefeicao } from "@/lib/nutrition";
import { usePlan } from "@/lib/plan-store";
import { cascata, useMontado } from "@/lib/motion";
import type { Meal } from "@/lib/types";

const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const DIAS_LONGOS = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
];

export default function Dieta() {
  const { carregando, erro, plan, profile, recarregar } = usePlan();
  const [offset, setOffset] = useState(0);
  const montado = useMontado(160);

  const semana = useMemo(() => {
    if (!plan) return [];
    const base = new Date(`${plan.date}T12:00:00`);
    const inicio = new Date(base);
    // a semana começa na segunda
    inicio.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      return {
        data: d,
        offset: Math.round((d.getTime() - base.getTime()) / 86400000),
      };
    });
  }, [plan]);

  if (carregando || !plan || !profile) {
    return (
      <Screen>
        <main className="flex-1 px-5 pt-6">
          {erro ? (
            <ErrorState
              titulo="Não foi possível carregar sua dieta"
              descricao="O plano continua salvo no aparelho. Foi a conexão que falhou."
              aoTentarDeNovo={recarregar}
            />
          ) : (
            <>
              <Skeleton className="h-9 w-40" />
              <Skeleton className="mt-4 h-14" />
              <Skeleton className="mt-5 h-[440px] rounded-3xl" />
            </>
          )}
        </main>
        <BottomNav />
      </Screen>
    );
  }

  const hoje = offset === 0;
  const diaSelecionado = semana.find((d) => d.offset === offset)?.data ?? new Date();
  const diaSemana = diaSelecionado.getDay();
  const treina = profile.trainingDays.includes(diaSemana);
  const refeicoes = hoje
    ? plan.meals
    : plan.meals.map((m) => ({ ...m, done: false }));
  const proximaId = hoje ? refeicoes.find((m) => !m.done)?.id : undefined;
  const totalDia = refeicoes.reduce((s, m) => s + totaisDaRefeicao(m).calories, 0);
  const feitasAte = refeicoes.findIndex((m) => !m.done);

  return (
    <Screen>
      <header className="shrink-0 px-5 pt-5 pb-3.5 area-segura-cima">
        <div className="flex items-center justify-between">
          <h1 className="animate-entra font-display text-[26px] font-bold tracking-[-0.025em]">
            Sua dieta
          </h1>
          <Link
            href="/nutri"
            className="group flex h-[38px] animate-entra items-center gap-[7px] rounded-full border border-linha bg-white px-3.5 text-[13px] font-semibold transition-[border-color,box-shadow] duration-250 hover:border-pedra hover:shadow-[0_8px_20px_-16px_rgba(21,37,28,.9)]"
            style={{ animationDelay: "80ms" }}
          >
            <span className="transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-125">
              <MarcaNutri size={16} />
            </span>
            Nutri
          </Link>
        </div>

        <div className="mt-3.5 flex justify-between" role="tablist" aria-label="Dias da semana">
          {semana.map(({ data, offset: o }, i) => {
            const ativo = o === offset;
            return (
              <button
                key={o}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setOffset(o)}
                style={cascata(i, 45, 120)}
                className={`flex h-14 w-[42px] animate-pop flex-col items-center justify-center gap-[3px] rounded-[14px] border transition-[background-color,color,border-color,transform,box-shadow] duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-90 ${
                  ativo
                    ? "-translate-y-0.5 border-tinta bg-tinta text-white shadow-[0_10px_20px_-14px_rgba(21,37,28,1)]"
                    : "border-linha bg-white text-tinta hover:border-pedra"
                }`}
              >
                <span className="text-[10.5px] font-medium opacity-80">
                  {DIAS_CURTOS[data.getDay()]}
                </span>
                <span className="text-[15px] font-semibold">{data.getDate()}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 px-5 pt-1">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[13px] text-fumo">
            {DIAS_LONGOS[diaSemana]}
            {treina ? ", dia de treino" : ", dia de descanso"}
          </p>
          <p className="text-[13px] font-semibold">{kcal(totalDia)}</p>
        </div>

        <ol className="relative list-none pl-6">
          <span className="absolute top-4 bottom-4 left-[5px] block w-0.5 rounded-full bg-linha" />
          {hoje && feitasAte > 0 ? (
            <span
              className="absolute top-4 left-[5px] block w-0.5 rounded-full bg-mata transition-[height] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ height: montado ? `${feitasAte * 118}px` : "0px" }}
            />
          ) : null}

          {refeicoes.map((meal, i) => (
            <LinhaRefeicao
              key={`${offset}-${meal.id}`}
              meal={meal}
              indice={i}
              proxima={meal.id === proximaId}
              clicavel={hoje}
            />
          ))}
        </ol>

        <p
          className="mt-4 animate-entra text-[12.5px] leading-normal text-fumo"
          style={{ animationDelay: "620ms" }}
        >
          Toda refeição pode ser trocada. O plano se reequilibra sozinho no fim do dia.
        </p>
      </main>

      <BottomNav />
    </Screen>
  );
}

function LinhaRefeicao({
  meal,
  indice,
  proxima,
  clicavel,
}: {
  meal: Meal;
  indice: number;
  proxima: boolean;
  clicavel: boolean;
}) {
  const { calories } = totaisDaRefeicao(meal);

  const corpo = (
    <>
      <div className="flex items-baseline gap-2.5">
        <span className="w-11 text-[12.5px] font-semibold text-fumo">{meal.time}</span>
        <span className="flex-1 text-base font-semibold tracking-[-0.01em]">{meal.name}</span>
        <span className={`text-[12.5px] ${proxima ? "font-semibold" : "text-fumo"}`}>
          {kcal(calories)}
        </span>
      </div>
      <p className="mt-1 pl-[54px] text-[13px] leading-snug text-fumo first-letter:uppercase">
        {meal.summary}
      </p>
      {proxima ? (
        <span className="mt-2.5 ml-[54px] inline-flex h-[26px] items-center gap-1.5 rounded-full bg-gema-fraca px-2.5">
          <span className="size-1.5 rounded-full bg-gema" />
          <span className="text-[11.5px] font-semibold text-gema-texto">Próxima refeição</span>
        </span>
      ) : meal.note ? (
        <span className="mt-2.5 ml-[54px] inline-flex h-[26px] items-center rounded-full bg-mata-fraca px-2.5 text-[11.5px] font-semibold text-mata-texto">
          {meal.note}
        </span>
      ) : null}
    </>
  );

  return (
    <li
      className="relative mb-2.5 animate-entra-lado-esq last:mb-0"
      style={cascata(indice, 75, 180)}
    >
      {meal.done ? (
        <span className="absolute top-[22px] -left-6 flex size-3 animate-pop items-center justify-center rounded-full bg-mata text-white">
          <IconeCheck size={8} strokeWidth={2.4} />
        </span>
      ) : proxima ? (
        <span className="absolute top-5 -left-[26px] block size-4">
          <span className="absolute inset-0 animate-halo rounded-full bg-gema" />
          <span className="absolute inset-0 rounded-full bg-gema shadow-[0_0_0_3px_var(--color-papel)]" />
        </span>
      ) : (
        <span className="absolute top-[23px] -left-[23px] size-2.5 rounded-full border-[1.5px] border-pedra bg-papel" />
      )}

      {clicavel ? (
        <Link
          href={`/dieta/${meal.id}`}
          className={`block rounded-[18px] border bg-white px-4 py-3.5 transition-[border-color,box-shadow,transform] duration-250 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-pedra hover:shadow-[0_14px_30px_-22px_rgba(21,37,28,.9)] active:scale-[0.99] ${
            proxima
              ? "border-tinta shadow-[inset_0_0_0_1px_var(--color-tinta)]"
              : "border-transparent"
          } ${meal.done ? "opacity-60" : ""}`}
        >
          {corpo}
        </Link>
      ) : (
        <div className="block rounded-[18px] border border-transparent bg-white px-4 py-3.5">
          {corpo}
        </div>
      )}
    </li>
  );
}
