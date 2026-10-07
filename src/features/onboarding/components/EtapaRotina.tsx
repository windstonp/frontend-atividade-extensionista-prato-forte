"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { cascata } from "@/lib/motion";
import { type CamposRotina, erroDe, validarRotina } from "../regras";
import type { Catalogo, LocalAlmoco, Respostas } from "../tipos";
import { type Etapa, useEtapa } from "../useEtapa";
import { EtapaEsperando } from "./EtapaEsperando";
import { MensagemDoGrupo } from "./MensagemDoGrupo";
import { DayToggleGroup } from "./DayToggleGroup";
import { OnboardingStep } from "./OnboardingStep";
import { type Horas, RoutineTimes } from "./RoutineTimes";

/** S07 — horários, dias de treino e almoço (RN12). Os horários das refeições saem daqui (RN14). */
export function EtapaRotina() {
  const etapa = useEtapa("rotina");
  if (!etapa.catalogo || !etapa.dados) return <EtapaEsperando etapa={etapa} />;
  return <FormRotina etapa={etapa} catalogo={etapa.catalogo} respostas={etapa.dados.answers} />;
}

function FormRotina({ etapa, catalogo, respostas }: { etapa: Etapa; catalogo: Catalogo; respostas: Respostas }) {
  const [horas, setHoras] = useState<Horas>({
    wakeTime: respostas.wakeTime ?? "06:20",
    trainingTime: respostas.trainingTime ?? "19:00",
    sleepTime: respostas.sleepTime ?? "23:00",
  });
  const [dias, setDias] = useState<number[]>(respostas.trainingDays);
  const [almoco, setAlmoco] = useState<LocalAlmoco | null>(respostas.lunchPlace);
  const [errosLocais, setErrosLocais] = useState<Partial<Record<keyof CamposRotina, string>>>({});

  const erro = (campo: keyof CamposRotina) => errosLocais[campo] ?? erroDe(etapa.errosCampo, campo);

  function mudarHora(campo: keyof Horas, valor: string) {
    setHoras((atual) => ({ ...atual, [campo]: valor }));
    setErrosLocais((atual) => ({ ...atual, [campo]: undefined }));
  }

  function continuar() {
    const encontrados = validarRotina({ ...horas, lunchPlace: almoco });
    setErrosLocais(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    void etapa.salvar({ ...horas, trainingDays: [...dias].sort((a, b) => a - b), lunchPlace: almoco });
  }

  return (
    <OnboardingStep {...etapa.casca} aoContinuar={continuar}>
      <RoutineTimes
        horas={horas}
        erros={{ wakeTime: erro("wakeTime"), trainingTime: erro("trainingTime"), sleepTime: erro("sleepTime") }}
        aoMudar={mudarHora}
      />

      <DayToggleGroup dias={dias} aoMudar={setDias} />

      <div className="mt-6">
        <span className="mb-2.5 block text-[12.5px] font-semibold text-fumo">Onde você almoça durante a semana?</span>
        <div className="flex flex-wrap gap-2">
          {catalogo.lunchPlaces.map((lugar, i) => (
            <Chip
              key={lugar.value}
              className="animate-escala"
              style={cascata(i, 60, 560)}
              marcado={almoco === lugar.value}
              onClick={() => {
                setAlmoco(lugar.value);
                setErrosLocais((atual) => ({ ...atual, lunchPlace: undefined }));
              }}
            >
              {lugar.label}
            </Chip>
          ))}
        </div>
        <MensagemDoGrupo texto={erro("lunchPlace")} />
        {almoco === "marmita" ? (
          <p className="mt-2.5 animate-entra text-[12.5px] leading-snug text-fumo">
            Quem leva marmita ganha sugestões que aguentam a manhã inteira na bolsa.
          </p>
        ) : null}
      </div>
    </OnboardingStep>
  );
}
