"use client";

import Link from "next/link";
import { BottomNav } from "@/components/app/BottomNav";
import { DayRail } from "@/components/app/DayRail";
import { ErrorState } from "@/components/app/ErrorState";
import { NutriBar } from "@/components/app/NutriBar";
import { Screen } from "@/components/app/Screen";
import { Rail, ReguaPeso } from "@/components/ui/Rail";
import { EsqueletoDoDia } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { CountUp } from "@/components/ui/CountUp";
import { dataPorExtenso, peso, saudacao } from "@/lib/format";
import { usePlan, useResumoDoDia } from "@/lib/plan-store";

export default function Hoje() {
  const {
    carregando, erro, plan, profile, ultimaAlteracao,
    alternarRefeicao, desfazer, recarregar, limparAviso,
  } = usePlan();
  const resumo = useResumoDoDia();

  if (carregando || !plan || !profile || !resumo) {
    return (
      <Screen>
        <header className="px-5 pt-5 pb-3 area-segura-cima">
          <div className="h-[68px]" />
        </header>
        <main className="flex-1">
          {erro ? (
            <ErrorState
              titulo="Não foi possível carregar seu dia"
              descricao="Seu plano está salvo. Só a conexão falhou agora."
              aoTentarDeNovo={recarregar}
            />
          ) : (
            <EsqueletoDoDia />
          )}
        </main>
        <BottomNav />
      </Screen>
    );
  }

  const proxima = plan.meals.find((m) => !m.done);
  const { consumido, planejado } = resumo;

  return (
    <Screen>
      <header className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3 area-segura-cima">
        <div>
          <p className="animate-entra text-[12.5px] text-fumo">{dataPorExtenso(plan.date)}</p>
          <h1
            className="mt-0.5 animate-entra font-display text-[26px] font-bold tracking-[-0.025em]"
            style={{ animationDelay: "70ms" }}
          >
            {saudacao()}, {profile.name.split(" ")[0]}
          </h1>
        </div>
        <Link
          href="/perfil"
          aria-label="Abrir seu perfil"
          className="flex size-[42px] shrink-0 animate-pop items-center justify-center rounded-full bg-tinta text-sm font-semibold text-neve transition-transform duration-300 hover:scale-105"
        >
          {profile.initials}
        </Link>
      </header>

      {ultimaAlteracao ? (
        <Toast
          texto={ultimaAlteracao.texto}
          acao={{ rotulo: "Desfazer", onClick: desfazer }}
          aoExpirar={limparAviso}
        />
      ) : null}

      <main className="flex-1 px-5 pt-3">
        <DayRail plan={plan} aoAlternar={alternarRefeicao} />

        <section className="mt-4 animate-entra" style={{ animationDelay: "420ms" }}>
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 className="font-display text-[15px] font-semibold">Metas de hoje</h2>
            <p className="text-[12.5px] text-fumo">
              <CountUp valor={Math.round(consumido.calories)} duracao={1100} /> de{" "}
              {Math.round(planejado.calories).toLocaleString("pt-BR")} kcal
            </p>
          </div>

          <Rail
            rotulo="Proteína"
            valor={consumido.macros.protein}
            meta={plan.targetMacros.protein}
            atraso={480}
          />
          <Rail
            rotulo="Carboidrato"
            valor={consumido.macros.carbs}
            meta={plan.targetMacros.carbs}
            cor="bg-gema"
            atraso={560}
          />
          <Rail
            rotulo="Gordura"
            valor={consumido.macros.fat}
            meta={plan.targetMacros.fat}
            cor="bg-mata"
            atraso={640}
          />

          <Link
            href="/evolucao"
            className="mt-3 flex h-10 items-center gap-3 border-t border-linha pt-3 transition-colors hover:text-mata"
          >
            <span className="w-[74px] shrink-0 text-[12.5px] text-fumo">Peso</span>
            <ReguaPeso
              inicio={profile.startWeightKg}
              atual={profile.weightKg}
              meta={profile.goalWeightKg}
            />
            <span className="w-[108px] shrink-0 text-right text-[12.5px] font-semibold tabular-nums">
              {peso(profile.weightKg)} de {peso(profile.goalWeightKg)}
            </span>
          </Link>
        </section>
      </main>

      <NutriBar
        className="mx-5 mt-4 mb-2.5 animate-entra"
        style={{ animationDelay: "760ms" }}
        texto={
          proxima
            ? `Perguntar ao Nutri sobre o ${proxima.name.toLowerCase()}`
            : "Perguntar alguma coisa ao Nutri"
        }
      />

      <BottomNav />
    </Screen>
  );
}
