"use client";

import { useState } from "react";
import { Segmento } from "@/components/ui/Field";
import { OptionRow } from "@/components/ui/OptionRow";
import { cascata } from "@/lib/motion";
import type { ActivityLevel } from "@/lib/types";
import { erroDe } from "../regras";
import type { Catalogo, PosturaTrabalho, Respostas } from "../tipos";
import { type Etapa, useEtapa } from "../useEtapa";
import { EtapaEsperando } from "./EtapaEsperando";
import { MensagemDoGrupo } from "./MensagemDoGrupo";
import { OnboardingStep } from "./OnboardingStep";

/** S04 — frequência de treino e tipo de trabalho, ambos obrigatórios. */
export function EtapaAtividade() {
  const etapa = useEtapa("atividade");
  if (!etapa.catalogo || !etapa.dados) return <EtapaEsperando etapa={etapa} />;
  return <FormAtividade etapa={etapa} catalogo={etapa.catalogo} respostas={etapa.dados.answers} />;
}

function FormAtividade({ etapa, catalogo, respostas }: { etapa: Etapa; catalogo: Catalogo; respostas: Respostas }) {
  const [nivel, setNivel] = useState<ActivityLevel | null>(respostas.activityLevel);
  const [postura, setPostura] = useState<PosturaTrabalho | null>(respostas.workPosture);

  return (
    <OnboardingStep
      {...etapa.casca}
      podeContinuar={nivel !== null && postura !== null}
      aoContinuar={() => void etapa.salvar({ activityLevel: nivel, workPosture: postura })}
    >
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Frequência de treino">
        {catalogo.activityLevels.map((opcao, i) => (
          <OptionRow
            key={opcao.value}
            className="animate-entra"
            style={cascata(i, 70, 180)}
            marcado={nivel === opcao.value}
            onClick={() => setNivel(opcao.value)}
            titulo={opcao.label}
            descricao={opcao.description}
          />
        ))}
      </div>
      <MensagemDoGrupo texto={erroDe(etapa.errosCampo, "activityLevel")} />

      <div className="mt-6 animate-entra" style={{ animationDelay: "480ms" }}>
        <Segmento
          label="E fora da academia, como é seu trabalho?"
          valor={postura}
          onChange={setPostura}
          erro={erroDe(etapa.errosCampo, "workPosture")}
          opcoes={catalogo.workPostures.map((p) => ({ valor: p.value, rotulo: p.label }))}
        />
      </div>
    </OnboardingStep>
  );
}
