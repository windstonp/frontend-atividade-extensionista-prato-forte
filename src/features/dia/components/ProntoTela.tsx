"use client";

import { Avaliacao } from "@/features/validacao/components/Avaliacao";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { IconeCheck } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMe } from "@/features/auth/hooks";
import { useDadosOnboarding } from "@/features/onboarding/hooks";
import { usePlano } from "../hooks";
import { PlanReadySummary } from "./PlanReadySummary";

/** S10 — o plano que acabou de ficar pronto, como "um dia comum". */
export function ProntoTela() {
  const busca = useSearchParams();
  const router = useRouter();
  const id = Number(busca.get("plano")) || null;
  const plano = usePlano(id);
  const nome = useMe().data?.preferredName ?? "";
  const treino = useDadosOnboarding().data?.answers.trainingTime ?? "…";
  const status = plano.data?.status;

  useEffect(() => {
    if (id === null) router.replace("/hoje");
    else if (status && status !== "ready") router.replace(`/onboarding/gerando?plano=${id}`);
  }, [id, status, router]);

  if (plano.isError) {
    return (
      <Screen>
        <main className="flex-1 px-6 pt-16">
          <ErrorState
            titulo="Não foi possível abrir seu plano"
            descricao="Ele está salvo. Foi a conexão que falhou agora."
            aoTentarDeNovo={() => void plano.refetch()}
          />
        </main>
      </Screen>
    );
  }

  if (status !== "ready" || !plano.data?.meals || !plano.data.targets) {
    return (
      <Screen>
        <main className="flex-1 px-6 pt-16">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="mt-6 h-20" />
          <Skeleton className="mt-6 h-[320px] rounded-[20px]" />
        </main>
      </Screen>
    );
  }

  const { meals, targets } = plano.data;

  return (
    <Screen>
      <main className="flex-1 px-6 pt-16 area-segura-cima">
        <span className="relative flex size-11 items-center justify-center rounded-full bg-mata text-white">
          <span className="absolute inset-0 animate-halo rounded-full bg-mata" />
          <span className="relative flex animate-pop items-center justify-center">
            <IconeCheck size={22} strokeWidth={2.1} />
          </span>
        </span>

        <h1
          className="mt-[22px] animate-entra font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em]"
          style={{ animationDelay: "160ms" }}
        >
          Seu plano está pronto{nome ? `, ${nome}` : ""}
        </h1>
        <p className="mt-3 animate-entra text-[15px] leading-relaxed text-fumo" style={{ animationDelay: "260ms" }}>
          Cinco refeições montadas com o que você marcou, encaixadas entre o trabalho e o treino das {treino}.
        </p>

        <PlanReadySummary refeicoes={meals} metas={targets} />

        <div className="mt-5 animate-entra" style={{ animationDelay: "900ms" }}>
          <p className="text-[14px] font-semibold">Esse plano faz sentido para você?</p>
          <Avaliacao alvo={{ tipo: "meal_plan", id: plano.data.id }} inicial={plano.data.rating ?? null} variante="plano" />
        </div>

        <p className="mt-4 animate-entra text-[13.5px] leading-normal text-fumo" style={{ animationDelay: "920ms" }}>
          Faltou algum alimento ou o horário não bate? O Nutri ajusta qualquer refeição em segundos.
        </p>
      </main>

      <footer className="flex shrink-0 animate-entra flex-col gap-3 px-6 pt-3.5 pb-8 area-segura-baixo" style={{ animationDelay: "1000ms" }}>
        <ButtonLink href="/hoje">Ver o dia de hoje</ButtonLink>
        <ButtonLink href="/nutri" variante="texto" className="h-11">
          Ajustar alguma coisa com o Nutri
        </ButtonLink>
      </footer>
    </Screen>
  );
}
