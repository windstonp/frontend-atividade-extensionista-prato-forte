"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { cascata } from "@/lib/motion";
import { erroDe } from "../regras";
import type { Catalogo, Respostas } from "../tipos";
import { type Etapa, useEtapa } from "../useEtapa";
import { EtapaEsperando } from "./EtapaEsperando";
import { MensagemDoGrupo } from "./MensagemDoGrupo";
import { OnboardingStep } from "./OnboardingStep";

/** S05 — itens da cozinha, vindos do catálogo. Nenhum é obrigatório. */
export function EtapaPreferencias() {
  const etapa = useEtapa("preferencias");
  if (!etapa.catalogo || !etapa.dados) return <EtapaEsperando etapa={etapa} />;
  return <FormPreferencias etapa={etapa} catalogo={etapa.catalogo} respostas={etapa.dados.answers} />;
}

function FormPreferencias({ etapa, catalogo, respostas }: { etapa: Etapa; catalogo: Catalogo; respostas: Respostas }) {
  const [marcados, setMarcados] = useState<string[]>(respostas.pantryItems);
  const total = marcados.length;
  const ordem = catalogo.pantry.flatMap((grupo) => grupo.items.map((item) => item.slug));

  const alternar = (slug: string) =>
    setMarcados((atual) => (atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug]));

  return (
    <OnboardingStep
      {...etapa.casca}
      aoContinuar={() => void etapa.salvar({ pantryItems: ordem.filter((slug) => marcados.includes(slug)) })}
      acimaDoBotao={
        <div className="mb-2.5 text-center" aria-live="polite">
          <p className="text-[12.5px] text-fumo">
            {total === 0 ? "Nada marcado ainda" : `${total} ${total === 1 ? "alimento marcado" : "alimentos marcados"}`}
          </p>
          {total < 5 ? (
            <p className="mt-0.5 text-[12.5px] text-fumo">Marque pelo menos uns 5 para o cardápio ficar com a sua cara.</p>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-col gap-[18px]">
        {catalogo.pantry.map((grupo, g) => (
          <div key={grupo.category}>
            <span className="animate-entra text-[12.5px] font-semibold text-fumo" style={cascata(g, 110, 160)}>
              {grupo.label}
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {grupo.items.map((item, i) => (
                <Chip
                  key={item.slug}
                  className="animate-escala"
                  style={cascata(i, 34, 200 + g * 110)}
                  marcado={marcados.includes(item.slug)}
                  onClick={() => alternar(item.slug)}
                >
                  {item.label}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
      <MensagemDoGrupo texto={erroDe(etapa.errosCampo, "pantryItems")} />
    </OnboardingStep>
  );
}
