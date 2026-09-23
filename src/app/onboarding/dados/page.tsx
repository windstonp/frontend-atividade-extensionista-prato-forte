"use client";

import { OnboardingStep } from "@/components/app/OnboardingStep";
import { Field, Segmento } from "@/components/ui/Field";
import { useOnboarding } from "@/lib/onboarding-store";

export default function Dados() {
  const { respostas, atualizar } = useOnboarding();

  return (
    <OnboardingStep
      etapa={2}
      voltarPara="/onboarding/objetivo"
      titulo="Agora, seus dados"
      descricao="Ficam só no seu perfil. Ninguém da academia vê."
      proximo="/onboarding/atividade"
    >
      <div className="flex flex-col gap-4">
        <Field
          id="nome"
          label="Como podemos te chamar"
          value={respostas.name}
          placeholder="Seu primeiro nome"
          onChange={(e) => atualizar("name", e.target.value)}
        />

        <div className="flex gap-3">
          <Field
            id="idade"
            label="Idade"
            sufixo="anos"
            inputMode="numeric"
            className="flex-1"
            value={respostas.age}
            placeholder="27"
            onChange={(e) => atualizar("age", e.target.value)}
          />
          <Field
            id="altura"
            label="Altura"
            sufixo="cm"
            inputMode="numeric"
            className="flex-1"
            value={respostas.heightCm}
            placeholder="164"
            onChange={(e) => atualizar("heightCm", e.target.value)}
          />
        </div>

        <Field
          id="peso"
          label="Peso de hoje"
          sufixo="kg"
          inputMode="decimal"
          value={respostas.weightKg}
          placeholder="58,4"
          ajuda="Se não souber agora, a balança da Zfit fica na recepção."
          onChange={(e) => atualizar("weightKg", e.target.value)}
        />

        <Segmento
          label="Sexo biológico"
          valor={respostas.sex}
          onChange={(v) => atualizar("sex", v)}
          ajuda="Usamos só no cálculo do gasto de energia."
          opcoes={[
            { valor: "feminino", rotulo: "Feminino" },
            { valor: "masculino", rotulo: "Masculino" },
            { valor: "nao-dizer", rotulo: "Prefiro não dizer" },
          ]}
        />
      </div>
    </OnboardingStep>
  );
}
