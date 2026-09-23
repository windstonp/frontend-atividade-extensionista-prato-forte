"use client";

import { OnboardingStep } from "@/components/app/OnboardingStep";
import { OptionRow } from "@/components/ui/OptionRow";
import { cascata } from "@/lib/motion";
import { useOnboarding } from "@/lib/onboarding-store";
import type { Goal } from "@/lib/types";

const OPCOES: { valor: Goal; titulo: string; descricao: string }[] = [
  {
    valor: "ganhar-massa",
    titulo: "Ganhar massa magra",
    descricao: "Comer um pouco acima do gasto, com proteína alta todo dia.",
  },
  {
    valor: "perder-gordura",
    titulo: "Perder gordura",
    descricao: "Déficit leve, mantendo a força nos treinos.",
  },
  {
    valor: "manter-peso",
    titulo: "Manter o peso",
    descricao: "Organizar os horários e equilibrar o que você já come.",
  },
  {
    valor: "mais-disposicao",
    titulo: "Ter mais disposição",
    descricao: "Energia para o treino sem chegar arrastada no fim do dia.",
  },
];

export default function Objetivo() {
  const { respostas, atualizar } = useOnboarding();

  return (
    <OnboardingStep
      etapa={1}
      voltarPara="/"
      titulo="Qual é seu objetivo agora?"
      descricao="Ele define suas calorias e a quantidade de proteína do dia."
      proximo="/onboarding/dados"
    >
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Objetivo">
        {OPCOES.map((o, i) => (
          <OptionRow
            key={o.valor}
            className="animate-entra"
            style={cascata(i, 70, 180)}
            marcado={respostas.goal === o.valor}
            onClick={() => atualizar("goal", o.valor)}
            titulo={o.titulo}
            descricao={o.descricao}
          />
        ))}
      </div>
    </OnboardingStep>
  );
}
