"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { EtiquetaAlergia, OptionRow } from "@/components/ui/OptionRow";
import { cascata } from "@/lib/motion";
import { erroDe, MENSAGENS, separarOutrasRestricoes } from "../regras";
import type { Catalogo, Respostas } from "../tipos";
import { type Etapa, useEtapa } from "../useEtapa";
import { EtapaEsperando } from "./EtapaEsperando";
import { MensagemDoGrupo } from "./MensagemDoGrupo";
import { OnboardingStep } from "./OnboardingStep";

/** S06 — restrições do catálogo + "Mais alguma coisa" separado por vírgula (RN16/RN17 usam os dois). */
export function EtapaRestricoes() {
  const etapa = useEtapa("restricoes");
  if (!etapa.catalogo || !etapa.dados) return <EtapaEsperando etapa={etapa} />;
  return <FormRestricoes etapa={etapa} catalogo={etapa.catalogo} respostas={etapa.dados.answers} />;
}

function FormRestricoes({ etapa, catalogo, respostas }: { etapa: Etapa; catalogo: Catalogo; respostas: Respostas }) {
  const [marcadas, setMarcadas] = useState<string[]>(respostas.restrictions);
  const [outras, setOutras] = useState(respostas.otherRestrictions.join(", "));
  const [erroOutras, setErroOutras] = useState<string>();

  const alternar = (slug: string) =>
    setMarcadas((atual) => (atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug]));

  function continuar() {
    const lista = separarOutrasRestricoes(outras);
    const problema =
      lista.length > 10
        ? MENSAGENS.outrasMuitas
        : lista.some((item) => [...item].length < 2 || [...item].length > 60)
          ? MENSAGENS.outraTamanho
          : undefined;
    setErroOutras(problema);
    if (problema) return;

    void etapa.salvar({
      restrictions: catalogo.restrictions.map((r) => r.slug).filter((slug) => marcadas.includes(slug)),
      otherRestrictions: lista,
    });
  }

  return (
    <OnboardingStep {...etapa.casca} aoContinuar={continuar}>
      <div className="flex flex-col gap-2">
        {catalogo.restrictions.map((restricao, i) => (
          <OptionRow
            key={restricao.slug}
            className="animate-entra"
            style={cascata(i, 55, 180)}
            quadrado
            compacto
            marcado={marcadas.includes(restricao.slug)}
            onClick={() => alternar(restricao.slug)}
            titulo={restricao.label}
            etiqueta={restricao.isAllergy ? <EtiquetaAlergia /> : undefined}
          />
        ))}
      </div>
      <MensagemDoGrupo texto={erroDe(etapa.errosCampo, "restrictions")} />

      <Field
        id="outra"
        label="Mais alguma coisa"
        className="mt-[18px] animate-entra"
        style={{ animationDelay: "520ms" }}
        placeholder="Ex.: camarão, pimenta, leite de vaca"
        ajuda="Separe por vírgula."
        value={outras}
        onChange={(e) => {
          setOutras(e.target.value);
          setErroOutras(undefined);
        }}
        erro={erroOutras ?? erroDe(etapa.errosCampo, "otherRestrictions")}
      />
    </OnboardingStep>
  );
}
