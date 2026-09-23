"use client";

import { OnboardingStep } from "@/components/app/OnboardingStep";
import { Chip } from "@/components/ui/Chip";
import { cascata } from "@/lib/motion";
import { useOnboarding } from "@/lib/onboarding-store";

const GRUPOS = [
  {
    titulo: "Proteínas",
    itens: ["Ovos", "Frango", "Carne moída", "Peixe", "Iogurte", "Queijo"],
  },
  {
    titulo: "Carboidratos",
    itens: [
      "Arroz e feijão",
      "Batata-doce",
      "Tapioca",
      "Macarrão",
      "Cuscuz",
      "Pão francês",
      "Aveia",
    ],
  },
  { titulo: "Frutas", itens: ["Banana", "Mamão", "Maçã", "Laranja"] },
];

export default function Preferencias() {
  const { respostas, alternarLista } = useOnboarding();
  const marcados = respostas.pantry.length;

  return (
    <OnboardingStep
      etapa={4}
      voltarPara="/onboarding/atividade"
      titulo="O que costuma ter na sua cozinha?"
      descricao="Marque o que você come sem reclamar. Seu cardápio sai daqui."
      proximo="/onboarding/restricoes"
      acimaDoBotao={
        <p className="mb-2.5 text-center text-[12.5px] text-fumo" aria-live="polite">
          {marcados === 0
            ? "Nada marcado ainda"
            : `${marcados} ${marcados === 1 ? "alimento marcado" : "alimentos marcados"}`}
        </p>
      }
    >
      <div className="flex flex-col gap-[18px]">
        {GRUPOS.map((grupo, g) => (
          <div key={grupo.titulo}>
            <span
              className="animate-entra text-[12.5px] font-semibold text-fumo"
              style={cascata(g, 110, 160)}
            >
              {grupo.titulo}
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {grupo.itens.map((item, i) => (
                <Chip
                  key={item}
                  className="animate-escala"
                  style={cascata(i, 34, 200 + g * 110)}
                  marcado={respostas.pantry.includes(item)}
                  onClick={() => alternarLista("pantry", item)}
                >
                  {item}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </OnboardingStep>
  );
}
