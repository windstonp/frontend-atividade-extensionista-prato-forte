"use client";

import { useState } from "react";
import { Field, Segmento } from "@/components/ui/Field";
import { cascata } from "@/lib/motion";
import { type CamposDados, erroDe, escreverNumero, lerNumero, pedeMeta, validarDados } from "../regras";
import type { Respostas, Sexo } from "../tipos";
import { type Etapa, useEtapa } from "../useEtapa";
import { EtapaEsperando } from "./EtapaEsperando";
import { GoalWeightField } from "./GoalWeightField";
import { OnboardingStep } from "./OnboardingStep";

const SEXOS: { valor: Sexo; rotulo: string }[] = [
  { valor: "feminino", rotulo: "Feminino" },
  { valor: "masculino", rotulo: "Masculino" },
  { valor: "nao-dizer", rotulo: "Prefiro não dizer" },
];

/** S03 — dados corporais e meta de peso (RN09, RN10). No modo edição, o peso vira a pesagem de hoje (RN34). */
export function EtapaDados() {
  const etapa = useEtapa("dados");
  if (!etapa.catalogo || !etapa.dados) return <EtapaEsperando etapa={etapa} />;
  return <FormDados etapa={etapa} respostas={etapa.dados.answers} />;
}

function FormDados({ etapa, respostas }: { etapa: Etapa; respostas: Respostas }) {
  const objetivo = respostas.goal;
  const [campos, setCampos] = useState<CamposDados>(() => ({
    preferredName: respostas.preferredName ?? "",
    age: respostas.age?.toString() ?? "",
    heightCm: respostas.heightCm?.toString() ?? "",
    weightKg: escreverNumero(respostas.weightKg),
    sex: respostas.sex,
    // Meta sugerida ou automática não volta para o campo: vazio quer dizer "sugira para mim".
    goalWeightKg: respostas.goalWeightSource === "user" ? escreverNumero(respostas.goalWeightKg) : "",
  }));
  const [errosLocais, setErrosLocais] = useState<Partial<Record<keyof CamposDados, string>>>({});

  function mudar<C extends keyof CamposDados>(campo: C, valor: CamposDados[C]) {
    setCampos((atual) => ({ ...atual, [campo]: valor }));
    setErrosLocais((atual) => ({ ...atual, [campo]: undefined }));
  }

  const erro = (campo: keyof CamposDados) => errosLocais[campo] ?? erroDe(etapa.errosCampo, campo);

  function continuar() {
    const encontrados = validarDados(campos, objetivo);
    setErrosLocais(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    void etapa.salvar({
      preferredName: campos.preferredName.trim(),
      age: Number(campos.age),
      heightCm: Number(campos.heightCm),
      weightKg: lerNumero(campos.weightKg),
      sex: campos.sex,
      goalWeightKg: pedeMeta(objetivo) ? lerNumero(campos.goalWeightKg) : null,
    });
  }

  const altura = lerNumero(campos.heightCm);

  return (
    <OnboardingStep {...etapa.casca} aoContinuar={continuar}>
      <div className="flex flex-col gap-4">
        <Field
          id="nome"
          label="Como podemos te chamar"
          autoComplete="given-name"
          value={campos.preferredName}
          placeholder="Seu primeiro nome"
          onChange={(e) => mudar("preferredName", e.target.value)}
          erro={erro("preferredName")}
          className="animate-entra"
          style={cascata(0, 60, 160)}
        />
        <div className="flex animate-entra gap-3" style={cascata(1, 60, 160)}>
          <Field
            id="idade"
            label="Idade"
            sufixo="anos"
            inputMode="numeric"
            className="flex-1"
            value={campos.age}
            placeholder="27"
            onChange={(e) => mudar("age", e.target.value)}
            erro={erro("age")}
          />
          <Field
            id="altura"
            label="Altura"
            sufixo="cm"
            inputMode="numeric"
            className="flex-1"
            value={campos.heightCm}
            placeholder="164"
            onChange={(e) => mudar("heightCm", e.target.value)}
            erro={erro("heightCm")}
          />
        </div>
        <Field
          id="peso"
          label="Peso de hoje"
          sufixo="kg"
          inputMode="decimal"
          value={campos.weightKg}
          placeholder="58,4"
          ajuda={etapa.editando ? "Vira a pesagem de hoje na sua evolução." : "Se não souber agora, a balança da Zfit fica na recepção."}
          onChange={(e) => mudar("weightKg", e.target.value)}
          erro={erro("weightKg")}
          className="animate-entra"
          style={cascata(2, 60, 160)}
        />
        <div className="animate-entra" style={cascata(3, 60, 160)}>
          <Segmento
            label="Sexo biológico"
            valor={campos.sex}
            onChange={(v) => mudar("sex", v)}
            ajuda="Usamos só no cálculo do gasto de energia."
            erro={erro("sex")}
            opcoes={SEXOS}
          />
        </div>
        <GoalWeightField
          objetivo={objetivo}
          alturaCm={altura !== null && !Number.isNaN(altura) ? altura : null}
          valor={campos.goalWeightKg}
          onChange={(v) => mudar("goalWeightKg", v)}
          erro={erro("goalWeightKg")}
          className="animate-entra"
          style={cascata(4, 60, 160)}
        />
      </div>
    </OnboardingStep>
  );
}
