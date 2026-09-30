"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/Toaster";
import { type ApiError, comoApiError } from "@/lib/api/errors";
import { recarregarEm } from "@/lib/navegar";
import { numeroDaEtapa, TEXTOS, TOTAL_ETAPAS } from "../etapas";
import { useCatalogo, useConcluirOnboarding, useDadosOnboarding, usePrevia } from "../hooks";
import { linhasDoResumo } from "../resumo";
import { OnboardingStep } from "./OnboardingStep";
import { PreviaDeMetas } from "./PreviaDeMetas";
import { SummaryList } from "./SummaryList";

/** S08 — confere tudo, mostra a prévia (RF08) e conclui o onboarding (RF07). */
export function EtapaResumo() {
  const catalogo = useCatalogo();
  const dados = useDadosOnboarding();
  const previa = usePrevia();
  const concluir = useConcluirOnboarding();
  const router = useRouter();
  const avisar = useToast();
  const [erro, setErro] = useState<ApiError | null>(null);

  const casca = {
    ...TEXTOS.resumo,
    numero: numeroDaEtapa("resumo"),
    total: TOTAL_ETAPAS,
    voltarPara: "/onboarding/rotina",
    rotuloBotao: "Gerar meu plano",
    rotuloSalvando: "Gerando…",
  };

  if (!catalogo.data || !dados.data) {
    const falhou = Boolean(catalogo.error || dados.error);
    return (
      <OnboardingStep
        {...casca}
        carregando={!falhou}
        erroAoCarregar={falhou ? { aoTentarDeNovo: () => { void catalogo.refetch(); void dados.refetch(); } } : null}
      />
    );
  }

  async function gerar() {
    setErro(null);
    let plano: number;
    try {
      plano = (await concluir.mutateAsync()).plan.id;
    } catch (e) {
      const falha = comoApiError(e);
      const etapa = falha.details.step;
      if (falha.code === "VALIDATION_ERROR" && typeof etapa === "string") {
        avisar({ texto: "Falta completar esta etapa." });
        router.push(`/onboarding/${etapa}?de=resumo`);
        return;
      }
      setErro(falha);
      return;
    }
    // Recarga: o `['me']` em cache ainda diz "onboarding incompleto" e o guarda voltaria para cá.
    recarregarEm(`/onboarding/gerando?plano=${plano}`);
  }

  return (
    <OnboardingStep
      {...casca}
      salvando={concluir.isPending || concluir.isSuccess}
      erroAoSalvar={erro}
      aoContinuar={() => void gerar()}
    >
      <SummaryList linhas={linhasDoResumo(dados.data.answers, catalogo.data)} />
      <PreviaDeMetas estado={previa.isPending ? "carregando" : (previa.data ?? "indisponivel")} />
    </OnboardingStep>
  );
}
