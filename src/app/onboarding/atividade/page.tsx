"use client";

import { OnboardingStep } from "@/components/app/OnboardingStep";
import { OptionRow } from "@/components/ui/OptionRow";
import { cascata } from "@/lib/motion";
import { Segmento } from "@/components/ui/Field";
import { useOnboarding } from "@/lib/onboarding-store";
import type { ActivityLevel } from "@/lib/types";

const OPCOES: { valor: ActivityLevel; titulo: string; descricao: string }[] = [
  { valor: "parado", titulo: "Quase não treino", descricao: "Menos de um treino por semana." },
  { valor: "leve", titulo: "1 ou 2 vezes na semana", descricao: "Musculação leve ou caminhada." },
  {
    valor: "moderado",
    titulo: "3 ou 4 vezes na semana",
    descricao: "O ritmo da maior parte do pessoal da Zfit.",
  },
  { valor: "intenso", titulo: "5 ou 6 vezes na semana", descricao: "Treino puxado quase todo dia." },
];

export default function Atividade() {
  const { respostas, atualizar } = useOnboarding();

  return (
    <OnboardingStep
      etapa={3}
      voltarPara="/onboarding/dados"
      titulo="Quantas vezes você treina?"
      descricao="Conte só o que acontece de verdade numa semana comum."
      proximo="/onboarding/preferencias"
    >
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Frequência de treino">
        {OPCOES.map((o, i) => (
          <OptionRow
            key={o.valor}
            className="animate-entra"
            style={cascata(i, 70, 180)}
            marcado={respostas.activity === o.valor}
            onClick={() => atualizar("activity", o.valor)}
            titulo={o.titulo}
            descricao={o.descricao}
          />
        ))}
      </div>

      <div className="mt-6">
        <Segmento
          label="E fora da academia, como é seu trabalho?"
          valor={respostas.workPosture}
          onChange={(v) => atualizar("workPosture", v)}
          opcoes={[
            { valor: "sentada", rotulo: "Sentada" },
            { valor: "em-pe", rotulo: "Em pé" },
            { valor: "peso-pesado", rotulo: "Peso pesado" },
          ]}
        />
      </div>
    </OnboardingStep>
  );
}
