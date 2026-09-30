"use client";

import Link from "next/link";
import { BottomNav } from "@/components/app/BottomNav";
import { ErrorState } from "@/components/app/ErrorState";
import { NutriBar } from "@/components/app/NutriBar";
import { Screen } from "@/components/app/Screen";
import { CountUp } from "@/components/ui/CountUp";
import { Rail, ReguaPeso } from "@/components/ui/Rail";
import { EsqueletoDoDia } from "@/components/ui/Skeleton";
import { iniciais } from "@/features/perfil/formato";
import { usePerfil } from "@/features/perfil/hooks";
import { dataPorExtenso, saudacao } from "@/lib/format";
import { useMedidas } from "@/lib/useMedidas";
import { useDia, useMarcandoRefeicao, useMarcarRefeicao, useTentarPlanoDeNovo } from "../hooks";
import { estadoSemPlano, planoSemAtivo } from "../regras";
import { AvisoDeAlteracao } from "./AvisoDeAlteracao";
import { DayRail } from "./DayRail";
import { NoPlanState } from "./NoPlanState";

/** S11 — o dia de hoje. */
export function HojeTela() {
  const dia = useDia();
  const perfil = usePerfil();
  const m = useMedidas();
  const marcar = useMarcarRefeicao();
  const marcando = useMarcandoRefeicao();
  const plano = useTentarPlanoDeNovo("/hoje");
  const semPlano = planoSemAtivo(dia.error);

  if (!dia.data || !perfil.data) {
    return (
      <Screen>
        <header className="px-5 pt-5 pb-3 area-segura-cima">
          <div className="h-[68px]" />
        </header>
        <main className="flex-1 px-5">
          {semPlano ? (
            <NoPlanState
              estado={estadoSemPlano(semPlano.status)}
              planId={semPlano.planId}
              tentando={plano.tentando}
              aoTentarDeNovo={() => void plano.tentar()}
            />
          ) : dia.isError || perfil.isError ? (
            <ErrorState
              titulo="Não foi possível carregar seu dia"
              descricao="Seu plano está salvo. Só a conexão falhou agora."
              aoTentarDeNovo={() => {
                void dia.refetch();
                void perfil.refetch();
              }}
            />
          ) : (
            <EsqueletoDoDia />
          )}
        </main>
        <BottomNav />
      </Screen>
    );
  }

  const { meals, totals, targets, date, lastChange } = dia.data;
  const eu = perfil.data;
  const proxima = meals.find((m) => m.isNext);
  const metas = targets ?? { proteinG: totals.planned.protein, carbsG: totals.planned.carbs, fatG: totals.planned.fat };

  return (
    <Screen>
      <header className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3 area-segura-cima">
        <div>
          <p className="animate-entra text-[12.5px] text-fumo">{dataPorExtenso(date)}</p>
          <h1 className="mt-0.5 animate-entra font-display text-[26px] font-bold tracking-[-0.025em]" style={{ animationDelay: "70ms" }}>
            {saudacao()}, {eu.preferredName}
          </h1>
        </div>
        <Link
          href="/perfil"
          aria-label="Abrir seu perfil"
          className="flex size-[42px] shrink-0 animate-pop items-center justify-center rounded-full bg-tinta text-sm font-semibold text-neve transition-transform duration-300 hover:scale-105"
        >
          {iniciais(eu.name)}
        </Link>
      </header>

      <AvisoDeAlteracao alteracao={lastChange} />

      <main className="flex-1 px-5 pt-3">
        <DayRail refeicoes={meals} ocupado={marcando} aoAlternar={(slot, done) => marcar.mutate({ slot, done })} />

        <section className="mt-4 animate-entra" style={{ animationDelay: "420ms" }}>
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 className="font-display text-[15px] font-semibold">Metas de hoje</h2>
            <p className="text-[12.5px] text-fumo">
              <CountUp valor={Math.round(totals.consumed.calories)} duracao={1100} /> de{" "}
              {Math.round(totals.planned.calories).toLocaleString("pt-BR")} kcal
            </p>
          </div>

          <Rail rotulo="Proteína" valor={totals.consumed.protein} meta={metas.proteinG} atraso={480} />
          <Rail rotulo="Carboidrato" valor={totals.consumed.carbs} meta={metas.carbsG} cor="bg-gema" atraso={560} />
          <Rail rotulo="Gordura" valor={totals.consumed.fat} meta={metas.fatG} cor="bg-mata" atraso={640} />

          {eu.goalWeightKg !== null ? (
            <Link
              href="/evolucao"
              className="mt-3 flex h-10 items-center gap-3 border-t border-linha pt-3 transition-colors hover:text-mata"
            >
              <span className="w-[74px] shrink-0 text-[12.5px] text-fumo">Peso</span>
              <ReguaPeso inicio={eu.startWeightKg} atual={eu.currentWeightKg} meta={eu.goalWeightKg} />
              <span className="w-[108px] shrink-0 text-right text-[12.5px] font-semibold tabular-nums">
                {m.peso(eu.currentWeightKg)} de {m.peso(eu.goalWeightKg)}
              </span>
            </Link>
          ) : null}
        </section>
      </main>

      <NutriBar
        className="mx-5 mt-4 mb-2.5 animate-entra"
        style={{ animationDelay: "760ms" }}
        href={
          proxima
            ? `/nutri?pergunta=${encodeURIComponent(`Tenho uma dúvida sobre o ${proxima.name.toLowerCase()} de hoje.`)}`
            : "/nutri"
        }
        texto={proxima ? `Perguntar ao Nutri sobre o ${proxima.name.toLowerCase()}` : "Perguntar alguma coisa ao Nutri"}
      />

      <BottomNav />
    </Screen>
  );
}
