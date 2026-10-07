"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/app/BottomNav";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { MarcaNutri } from "@/components/icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { kcal } from "@/lib/format";
import { useMontado } from "@/lib/motion";
import { useDia, useTentarPlanoDeNovo } from "../hooks";
import { estadoSemPlano, planoSemAtivo, semanaDe } from "../regras";
import { MealRow } from "./MealRow";
import { NoPlanState } from "./NoPlanState";
import { WeekDayPicker } from "./WeekDayPicker";
import { EmptyState } from "@/components/ui/EmptyState";

const DIAS_LONGOS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

/** S12 — a semana: hoje editável, futuro em prévia, passado como foi (RN22, RN23). */
export function DietaTela() {
  const hoje = useDia();
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const dataHoje = hoje.data?.date;
  const selecionado = escolhido ?? dataHoje ?? null;
  const outro = useDia(selecionado && selecionado !== dataHoje ? selecionado : "today");
  const dia = selecionado === dataHoje ? hoje : outro;

  return (
    <Screen>
      <header className="shrink-0 px-5 pt-seguro-5 pb-3.5">
        <div className="flex items-center justify-between">
          <h1 className="animate-entra font-display text-[26px] font-bold tracking-[-0.025em]">Sua dieta</h1>
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

        {dataHoje && selecionado ? (
          <WeekDayPicker dias={semanaDe(dataHoje)} hoje={dataHoje} selecionado={selecionado} aoEscolher={setEscolhido} />
        ) : (
          <Skeleton className="mt-3.5 h-14" />
        )}
      </header>

      <main className="flex-1 px-5 pt-1">
        <Conteudo dia={dia} />
      </main>

      <BottomNav />
    </Screen>
  );
}

function Conteudo({ dia }: { dia: ReturnType<typeof useDia> }) {
  const montado = useMontado(160);
  const semPlano = planoSemAtivo(dia.error);
  const plano = useTentarPlanoDeNovo("/dieta");

  if (semPlano) {
    return (
      <NoPlanState
        estado={estadoSemPlano(semPlano.status)}
        planId={semPlano.planId}
        tentando={plano.tentando}
        aoTentarDeNovo={() => void plano.tentar()}
      />
    );
  }
  if (dia.isError) {
    return (
      <ErrorState
        titulo="Não foi possível carregar sua dieta"
        descricao="Seu plano está salvo. Foi a conexão que falhou."
        aoTentarDeNovo={() => void dia.refetch()}
      />
    );
  }
  if (!dia.data) {
    return (
      <>
        <Skeleton className="h-[110px] rounded-[18px]" />
        <Skeleton className="mt-2.5 h-[110px] rounded-[18px]" />
        <Skeleton className="mt-2.5 h-[110px] rounded-[18px]" />
      </>
    );
  }

  const { date, editable, isToday, isTrainingDay, meals, totals } = dia.data;
  const semana = new Date(`${date}T12:00:00`).getDay();
  const feitasAte = isToday ? Math.max(0, meals.findIndex((m) => !m.done)) : 0;

  return (
    <>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[13px] text-fumo">
          {DIAS_LONGOS[semana]}
          {isTrainingDay ? ", dia de treino" : ", dia de descanso"}
        </p>
        {meals.length > 0 ? <p className="text-[13px] font-semibold">{kcal(totals.planned.calories)}</p> : null}
      </div>

      {meals.length === 0 ? (
        <EmptyState titulo="Nada registrado neste dia" className="mt-6" />
      ) : (
        <div className="relative pl-6">
          <span className="absolute top-4 bottom-4 left-[5px] block w-0.5 rounded-full bg-linha" />
          {feitasAte > 0 ? (
            <span
              className="absolute top-4 left-[5px] block w-0.5 rounded-full bg-mata transition-[height] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ height: montado ? `${feitasAte * 118}px` : "0px" }}
            />
          ) : null}
          {/* os traços ficam fora da lista: <ol> só pode ter <li> */}
          <ol className="list-none">
            {meals.map((refeicao, i) => (
              <MealRow
                key={`${date}-${refeicao.slot}`}
                refeicao={refeicao}
                indice={i}
                clicavel={editable}
                href={isToday ? `/dieta/${refeicao.slot}` : `/dieta/${refeicao.slot}?data=${date}`}
                mostrarRegistro={editable || dia.data.materialized} // futuro (prévia) só mostra a meta
              />
            ))}
          </ol>
        </div>
      )}

      {editable ? (
        <p className="mt-4 animate-entra text-[12.5px] leading-normal text-fumo" style={{ animationDelay: "620ms" }}>
          Registre o que você comeu. A sugestão de cada refeição é um atalho para bater a meta.
        </p>
      ) : null}
    </>
  );
}
