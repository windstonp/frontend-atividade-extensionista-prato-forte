"use client";

import { useState } from "react";
import { Field, Segmento } from "@/components/ui/Field";
import { useMe } from "@/features/auth/hooks";
import { cascata } from "@/lib/motion";
import { cmParaPesPol, type Medidas, medidas, pesPolParaCm } from "@/lib/units";
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
  const me = useMe();
  // Espera a preferência de unidade: abrir em kg e salvar como lb daria o peso errado (RN39).
  if (!etapa.catalogo || !etapa.dados || me.isPending) return <EtapaEsperando etapa={etapa} />;
  return <FormDados etapa={etapa} respostas={etapa.dados.answers} m={medidas(me.data?.settings?.unitSystem ?? "metric")} />;
}

const inteiro = (texto: string) => (/^\d+$/.test(texto.trim()) ? Number(texto.trim()) : null);

function FormDados({ etapa, respostas, m: medidasAgora }: { etapa: Etapa; respostas: Respostas; m: Medidas }) {
  // A unidade fica a da montagem: os campos já foram preenchidos nela (trocar no meio salvaria errado).
  const [m] = useState(medidasAgora);
  const imperial = m.sistema === "imperial";
  const exibir = (kg: number | null | undefined) => (kg == null ? "" : escreverNumero(m.exibir(kg)));
  const objetivo = respostas.goal;
  const [campos, setCampos] = useState<CamposDados>(() => ({
    preferredName: respostas.preferredName ?? "",
    age: respostas.age?.toString() ?? "",
    heightCm: respostas.heightCm?.toString() ?? "",
    weightKg: exibir(respostas.weightKg),
    sex: respostas.sex,
    // Meta sugerida ou automática não volta para o campo: vazio quer dizer "sugira para mim".
    goalWeightKg: respostas.goalWeightSource === "user" ? exibir(respostas.goalWeightKg) : "",
  }));
  // Imperial: altura em pés e polegadas; `heightCm` guarda sempre os centímetros que vão para a API.
  const [pesPol, setPesPol] = useState(() => {
    if (respostas.heightCm == null) return { pes: "", pol: "" };
    const { pes, pol } = cmParaPesPol(respostas.heightCm);
    return { pes: String(pes), pol: String(pol) };
  });

  function mudarAltura(parte: "pes" | "pol", valor: string) {
    const novo = { ...pesPol, [parte]: valor };
    setPesPol(novo);
    const pes = inteiro(novo.pes);
    const pol = novo.pol.trim() === "" ? 0 : inteiro(novo.pol); // só os pés: 5 ft = 5 ft 0 in
    mudar("heightCm", pes !== null && pol !== null && pes >= 3 && pes <= 8 && pol <= 11 ? String(pesPolParaCm(pes, pol)) : "");
  }

  /** O texto digitado na unidade da pessoa vira kg (1 casa); inválido segue como está para a validação acusar. */
  function emKg(texto: string) {
    const n = lerNumero(texto);
    return n === null || Number.isNaN(n) ? texto : escreverNumero(m.paraApi(m.deExibido(n)));
  }
  const [errosLocais, setErrosLocais] = useState<Partial<Record<keyof CamposDados, string>>>({});

  function mudar<C extends keyof CamposDados>(campo: C, valor: CamposDados[C]) {
    setCampos((atual) => ({ ...atual, [campo]: valor }));
    setErrosLocais((atual) => ({ ...atual, [campo]: undefined }));
  }

  const erro = (campo: keyof CamposDados) => errosLocais[campo] ?? erroDe(etapa.errosCampo, campo);

  function continuar() {
    const emQuilos = { ...campos, weightKg: emKg(campos.weightKg), goalWeightKg: emKg(campos.goalWeightKg) };
    const encontrados = validarDados(emQuilos, objetivo);
    setErrosLocais(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    void etapa.salvar({
      preferredName: campos.preferredName.trim(),
      age: Number(campos.age),
      heightCm: Number(campos.heightCm),
      weightKg: lerNumero(emQuilos.weightKg),
      sex: campos.sex,
      goalWeightKg: pedeMeta(objetivo) ? lerNumero(emQuilos.goalWeightKg) : null,
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
          {imperial ? (
            <>
              <Field
                id="altura"
                label="Altura"
                sufixo="ft"
                inputMode="numeric"
                className="flex-1"
                value={pesPol.pes}
                placeholder="5"
                onChange={(e) => mudarAltura("pes", e.target.value)}
                erro={erro("heightCm")}
              />
              <Field
                id="polegadas"
                label="Polegadas"
                sufixo="in"
                inputMode="numeric"
                className="flex-1"
                value={pesPol.pol}
                placeholder="5"
                onChange={(e) => mudarAltura("pol", e.target.value)}
              />
            </>
          ) : (
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
          )}
        </div>
        <Field
          id="peso"
          label="Peso de hoje"
          sufixo={m.unidadePeso}
          inputMode="decimal"
          value={campos.weightKg}
          placeholder={imperial ? "128,7" : "58,4"}
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
          medidas={m}
          onChange={(v) => mudar("goalWeightKg", v)}
          erro={erro("goalWeightKg")}
          className="animate-entra"
          style={cascata(4, 60, 160)}
        />
      </div>
    </OnboardingStep>
  );
}
