"use client";

import type { Etapa } from "../useEtapa";
import { OnboardingStep } from "./OnboardingStep";

/** A etapa enquanto catálogo e respostas carregam (ou falham): cabeçalho e progresso já visíveis. */
export function EtapaEsperando({ etapa }: { etapa: Etapa }) {
  return <OnboardingStep {...etapa.casca} carregando={!etapa.erroAoCarregar} erroAoCarregar={etapa.erroAoCarregar} />;
}
