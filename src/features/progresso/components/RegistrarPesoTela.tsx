"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toaster";
import { usePerfil } from "@/features/perfil/hooks";
import { comoApiError } from "@/lib/api/errors";
import { dataPorExtenso } from "@/lib/format";
import { usePesagens, useRegistrarPeso } from "../hooks";
import { diasEntre, hojeLocal } from "../regras";
import { HistoricoPesagens } from "./HistoricoPesagens";
import { WeightDeltaMessage } from "./WeightDeltaMessage";
import { WeightStepper } from "./WeightStepper";

/** S16 — registrar o peso de hoje (RF23, RN34). */
export function RegistrarPesoTela() {
  const router = useRouter();
  const avisar = useToast();
  const perfil = usePerfil();
  const pesagens = usePesagens();
  const registrar = useRegistrarPeso();
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const hoje = hojeLocal();

  if (!perfil.data || !pesagens.data) {
    return (
      <Screen>
        <TopBar voltarPara="/evolucao" rotuloVoltar="Voltar para a evolução" />
        <main className="flex-1 px-5 pt-3" role="status" aria-label="Carregando suas pesagens">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="mt-6 h-[220px] rounded-3xl" />
        </main>
      </Screen>
    );
  }

  const lista = pesagens.data;
  const ultima = lista[lista.length - 1];
  const base = ultima?.weightKg ?? perfil.data.startWeightKg;
  const valor = escolhido ?? base;
  const jaPesouHoje = ultima?.date === hoje;
  const anterior = jaPesouHoje ? lista[lista.length - 2] : ultima;

  function salvar() {
    registrar.mutate(valor, {
      onSuccess: () => router.push("/evolucao"),
      onError: (e) => avisar({ texto: comoApiError(e).message }),
    });
  }

  return (
    <Screen>
      <TopBar voltarPara="/evolucao" rotuloVoltar="Voltar para a evolução" />

      <main className="flex-1 px-5 pt-2">
        <h1 className="animate-entra font-display text-[30px] leading-tight font-bold tracking-[-0.03em]">Quanto a balança marcou?</h1>
        <p className="mt-2 animate-entra text-sm leading-normal text-fumo" style={{ animationDelay: "80ms" }}>
          {dataPorExtenso(hoje)}.
        </p>
        {jaPesouHoje ? (
          <p className="mt-3 animate-entra rounded-2xl bg-gema-fraca px-4 py-3 text-[13.5px] leading-snug text-gema-texto" style={{ animationDelay: "120ms" }}>
            Você já registrou hoje. Salvar vai atualizar o valor.
          </p>
        ) : null}

        <section className="mt-[22px] animate-escala rounded-[20px] bg-white px-[18px] pt-[22px] pb-[18px]" style={{ animationDelay: "140ms" }}>
          <WeightStepper valor={valor} base={base} aoMudar={setEscolhido} />
          {anterior ? (
            <WeightDeltaMessage objetivo={perfil.data.goal} diferencaKg={valor - anterior.weightKg} diasDesdeUltima={diasEntre(anterior.date, hoje)} />
          ) : null}
        </section>

        {lista.length > 0 ? (
          <>
            <h2 className="mt-[22px] animate-entra font-display text-[15px] font-semibold" style={{ animationDelay: "300ms" }}>
              Suas pesagens
            </h2>
            <HistoricoPesagens pesagens={lista} />
          </>
        ) : null}
      </main>

      <footer className="flex shrink-0 animate-entra flex-col gap-2.5 px-5 pt-3.5 pb-7 area-segura-baixo" style={{ animationDelay: "520ms" }}>
        <Button onClick={salvar} carregando={registrar.isPending} rotuloCarregando="Salvando">
          Salvar peso de hoje
        </Button>
        <p className="text-center text-[12.5px] text-fumo">Pese-se de manhã, antes de comer, sempre na mesma balança.</p>
      </footer>
    </Screen>
  );
}
