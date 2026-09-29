"use client";

import { useState } from "react";
import { OptionRow } from "@/components/ui/OptionRow";
import { cascata } from "@/lib/motion";
import type { Goal } from "@/lib/types";
import { erroDe } from "../regras";
import type { Catalogo, Respostas } from "../tipos";
import { type Etapa, useEtapa } from "../useEtapa";
import { EtapaEsperando } from "./EtapaEsperando";
import { MensagemDoGrupo } from "./MensagemDoGrupo";
import { OnboardingStep } from "./OnboardingStep";

/** S02 — sem pré-seleção, para não enviesar a escolha. */
export function EtapaObjetivo() {
  const etapa = useEtapa("objetivo");
  if (!etapa.catalogo || !etapa.dados) return <EtapaEsperando etapa={etapa} />;
  return <FormObjetivo etapa={etapa} catalogo={etapa.catalogo} respostas={etapa.dados.answers} />;
}

function FormObjetivo({ etapa, catalogo, respostas }: { etapa: Etapa; catalogo: Catalogo; respostas: Respostas }) {
  const [objetivo, setObjetivo] = useState<Goal | null>(respostas.goal);

  return (
    <OnboardingStep {...etapa.casca} podeContinuar={objetivo !== null} aoContinuar={() => void etapa.salvar({ goal: objetivo })}>
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Objetivo">
        {catalogo.goals.map((opcao, i) => (
          <OptionRow
            key={opcao.value}
            className="animate-entra"
            style={cascata(i, 70, 180)}
            marcado={objetivo === opcao.value}
            onClick={() => setObjetivo(opcao.value)}
            titulo={opcao.label}
            descricao={opcao.description}
          />
        ))}
      </div>
      <MensagemDoGrupo texto={erroDe(etapa.errosCampo, "goal")} />
    </OnboardingStep>
  );
}
