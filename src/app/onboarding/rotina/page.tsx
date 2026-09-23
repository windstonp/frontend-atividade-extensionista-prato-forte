"use client";

import { OnboardingStep } from "@/components/app/OnboardingStep";
import { Chip } from "@/components/ui/Chip";
import { cascata } from "@/lib/motion";
import { useOnboarding } from "@/lib/onboarding-store";

const DIAS = [
  { n: 0, letra: "D", nome: "domingo" },
  { n: 1, letra: "S", nome: "segunda" },
  { n: 2, letra: "T", nome: "terça" },
  { n: 3, letra: "Q", nome: "quarta" },
  { n: 4, letra: "Q", nome: "quinta" },
  { n: 5, letra: "S", nome: "sexta" },
  { n: 6, letra: "S", nome: "sábado" },
];

const LUGARES = [
  { valor: "casa", rotulo: "Em casa" },
  { valor: "marmita", rotulo: "Marmita no trabalho" },
  { valor: "restaurante", rotulo: "Restaurante" },
] as const;

export default function Rotina() {
  const { respostas, atualizar, alternarDia } = useOnboarding();

  const horarios = [
    { id: "acorda", rotulo: "Acorda às", campo: "wakeTime" },
    { id: "treina", rotulo: "Treina às", campo: "trainingTime" },
    { id: "dorme", rotulo: "Dorme às", campo: "sleepTime" },
  ] as const;

  return (
    <OnboardingStep
      etapa={6}
      voltarPara="/onboarding/restricoes"
      titulo="Como é o seu dia?"
      descricao="Os horários das refeições saem daqui, inclusive o pré-treino."
      proximo="/onboarding/resumo"
    >
      <div className="rounded-[18px] bg-white px-4">
        {horarios.map(({ id, rotulo, campo }, i) => (
          <div
            key={id}
            style={cascata(i, 70, 180)}
            className={`flex min-h-16 animate-entra items-center justify-between ${
              i < horarios.length - 1 ? "border-b border-fio" : ""
            }`}
          >
            <label htmlFor={id} className="text-[15px] font-medium">
              {rotulo}
            </label>
            <input
              id={id}
              type="time"
              value={respostas[campo]}
              onChange={(e) => atualizar(campo, e.target.value)}
              className="h-12 w-[110px] rounded-xl border border-linha bg-white text-center font-display text-[19px] font-semibold tracking-[-0.01em] focus:border-tinta focus:shadow-[inset_0_0_0_1px_var(--color-tinta)] focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <span className="mb-2.5 block text-[12.5px] font-semibold text-fumo">
          Dias de treino
        </span>
        <div className="flex justify-between">
          {DIAS.map((dia, i) => {
            const marcado = respostas.trainingDays.includes(dia.n);
            return (
              <button
                key={dia.n}
                type="button"
                style={cascata(i, 45, 420)}
                aria-pressed={marcado}
                aria-label={dia.nome}
                onClick={() => alternarDia(dia.n)}
                className={`flex size-10 animate-pop items-center justify-center rounded-full border text-sm font-semibold transition-[background-color,color,border-color,transform] duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-90 ${
                  marcado
                    ? "scale-105 border-tinta bg-tinta text-white"
                    : "border-linha bg-white text-tinta hover:border-pedra"
                }`}
              >
                {dia.letra}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <span className="mb-2.5 block text-[12.5px] font-semibold text-fumo">
          Onde você almoça durante a semana?
        </span>
        <div className="flex flex-wrap gap-2">
          {LUGARES.map((l, i) => (
            <Chip
              key={l.valor}
              className="animate-escala"
              style={cascata(i, 60, 560)}
              marcado={respostas.lunchPlace === l.valor}
              onClick={() => atualizar("lunchPlace", l.valor)}
            >
              {l.rotulo}
            </Chip>
          ))}
        </div>
        {respostas.lunchPlace === "marmita" ? (
          <p className="mt-2.5 animate-entra text-[12.5px] leading-snug text-fumo">
            Quem leva marmita ganha sugestões que aguentam a manhã inteira na bolsa.
          </p>
        ) : null}
      </div>
    </OnboardingStep>
  );
}
