"use client";

import { BottomNav } from "@/components/app/BottomNav";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { ButtonLink } from "@/components/ui/Button";
import { Segmento } from "@/components/ui/Field";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePeriodo, useProgresso } from "../hooks";
import type { Periodo } from "../tipos";
import { AdherenceGrid } from "./AdherenceGrid";
import { EvolucaoVazia } from "./EvolucaoVazia";
import { MediasDoPeriodo } from "./MediasDoPeriodo";
import { WeightChart } from "./WeightChart";

const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: "6w", rotulo: "6 semanas" },
  { valor: "3m", rotulo: "3 meses" },
  { valor: "all", rotulo: "Tudo" },
];

/** S15 — peso, constância e médias (RF24, RF25). */
export function EvolucaoTela() {
  const [periodo, setPeriodo] = usePeriodo();
  const progresso = useProgresso(periodo);
  const dados = progresso.data;

  return (
    <Screen>
      <header className="shrink-0 px-5 pt-5 pb-3 area-segura-cima">
        <h1 className="animate-entra font-display text-[26px] font-bold tracking-[-0.025em]">Sua evolução</h1>
        <div className="mt-3">
          <Segmento label="Período" opcoes={PERIODOS} valor={periodo} onChange={setPeriodo} />
        </div>
      </header>

      <main className={`flex-1 px-5 pt-1 transition-opacity duration-300 ${progresso.isPlaceholderData ? "opacity-60" : ""}`}>
        {progresso.isError && !dados ? (
          <ErrorState
            titulo="Não foi possível carregar sua evolução"
            descricao="Suas pesagens estão salvas. Foi a conexão que falhou."
            aoTentarDeNovo={() => void progresso.refetch()}
          />
        ) : !dados ? (
          <div role="status" aria-label="Carregando sua evolução">
            <Skeleton className="h-[260px] rounded-3xl" />
            <Skeleton className="mt-4 h-[240px] rounded-3xl" />
            <Skeleton className="mt-4 h-6 w-1/2" />
            <Skeleton className="mt-3 h-10" />
          </div>
        ) : (
          <>
            {dados.weight.points.length === 0 ? <EvolucaoVazia /> : <WeightChart key={periodo} peso={dados.weight} />}
            <Reveal className="mt-3.5">
              <AdherenceGrid constancia={dados.adherence} />
            </Reveal>
            <Reveal className="mt-3.5" atraso={80}>
              <MediasDoPeriodo medias={dados.averages} />
            </Reveal>
          </>
        )}
      </main>

      <div className="shrink-0 px-5 pt-3.5 pb-2.5">
        <ButtonLink href="/evolucao/peso">Registrar peso da semana</ButtonLink>
      </div>

      <BottomNav />
    </Screen>
  );
}
