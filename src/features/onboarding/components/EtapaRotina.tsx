"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { cascata } from "@/lib/motion";
import { type CamposRotina, erroDe, validarRotina } from "../regras";
import type { Catalogo, LocalAlmoco, Respostas } from "../tipos";
import { type Etapa, useEtapa } from "../useEtapa";
import { EtapaEsperando } from "./EtapaEsperando";
import { MensagemDoGrupo } from "./MensagemDoGrupo";
import { OnboardingStep } from "./OnboardingStep";

const DIAS = [
  { n: 0, letra: "D", nome: "domingo" },
  { n: 1, letra: "S", nome: "segunda" },
  { n: 2, letra: "T", nome: "terça" },
  { n: 3, letra: "Q", nome: "quarta" },
  { n: 4, letra: "Q", nome: "quinta" },
  { n: 5, letra: "S", nome: "sexta" },
  { n: 6, letra: "S", nome: "sábado" },
];

const HORARIOS = [
  { id: "acorda", rotulo: "Acorda às", campo: "wakeTime" },
  { id: "treina", rotulo: "Treina às", campo: "trainingTime" },
  { id: "dorme", rotulo: "Dorme às", campo: "sleepTime" },
] as const;

type Horas = Pick<CamposRotina, "wakeTime" | "trainingTime" | "sleepTime">;

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
      <div className="rounded-[18px] bg-white px-4">
        {HORARIOS.map(({ id, rotulo, campo }, i) => {
          const mensagem = erro(campo);
          return (
            <div
              key={id}
              style={cascata(i, 70, 180)}
              className={`animate-entra py-2 ${i < HORARIOS.length - 1 ? "border-b border-fio" : ""}`}
            >
              <div className="flex min-h-12 items-center justify-between">
                <label htmlFor={id} className="text-[15px] font-medium">
                  {rotulo}
                </label>
                <input
                  id={id}
                  type="time"
                  value={horas[campo]}
                  aria-invalid={mensagem ? true : undefined}
                  aria-describedby={mensagem ? `${id}-mensagem` : undefined}
                  onChange={(e) => mudarHora(campo, e.target.value)}
                  className={`h-12 w-[110px] rounded-xl border bg-white text-center font-display text-[19px] font-semibold tracking-[-0.01em] focus:outline-none ${
                    mensagem ? "border-alerta" : "border-linha focus:border-tinta focus:shadow-[inset_0_0_0_1px_var(--color-tinta)]"
                  }`}
                />
              </div>
              {mensagem ? (
                <p id={`${id}-mensagem`} className="mb-1 animate-entra text-[12.5px] leading-snug font-medium text-alerta">
                  {mensagem}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <span className="mb-2.5 block text-[12.5px] font-semibold text-fumo">Dias de treino</span>
        <div className="flex justify-between">
          {DIAS.map((dia, i) => {
            const marcado = dias.includes(dia.n);
            return (
              <button
                key={dia.n}
                type="button"
                style={cascata(i, 45, 420)}
                aria-pressed={marcado}
                aria-label={dia.nome}
                onClick={() => setDias((atual) => (marcado ? atual.filter((d) => d !== dia.n) : [...atual, dia.n]))}
                className={`flex size-10 animate-pop items-center justify-center rounded-full border text-sm font-semibold transition-[background-color,color,border-color,transform] duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-90 ${
                  marcado ? "scale-105 border-tinta bg-tinta text-white" : "border-linha bg-white text-tinta hover:border-pedra"
                }`}
              >
                {dia.letra}
              </button>
            );
          })}
        </div>
      </div>

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
