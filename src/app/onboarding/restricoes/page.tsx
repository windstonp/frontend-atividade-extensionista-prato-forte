"use client";

import { OnboardingStep } from "@/components/app/OnboardingStep";
import { EtiquetaAlergia, OptionRow } from "@/components/ui/OptionRow";
import { Field } from "@/components/ui/Field";
import { cascata } from "@/lib/motion";
import { useOnboarding } from "@/lib/onboarding-store";

const ITENS = [
  { id: "lactose", rotulo: "Intolerância a lactose", alergia: false },
  { id: "gluten", rotulo: "Glúten", alergia: false },
  { id: "castanhas", rotulo: "Amendoim e castanhas", alergia: true },
  { id: "frutos-do-mar", rotulo: "Frutos do mar", alergia: true },
  { id: "sem-carne", rotulo: "Não como carne", alergia: false },
  { id: "sem-animal", rotulo: "Não como nada de origem animal", alergia: false },
];

export default function Restricoes() {
  const { respostas, alternarLista, atualizar } = useOnboarding();

  return (
    <OnboardingStep
      etapa={5}
      voltarPara="/onboarding/preferencias"
      titulo="Tem algo que você não pode comer?"
      descricao="O Nutri nunca sugere um alimento marcado aqui, nem nas substituições."
      proximo="/onboarding/rotina"
    >
      <div className="flex flex-col gap-2">
        {ITENS.map((item, i) => (
          <OptionRow
            key={item.id}
            className="animate-entra"
            style={cascata(i, 55, 180)}
            quadrado
            compacto
            marcado={respostas.restrictions.includes(item.id)}
            onClick={() => alternarLista("restrictions", item.id)}
            titulo={item.rotulo}
            etiqueta={item.alergia ? <EtiquetaAlergia /> : undefined}
          />
        ))}
      </div>

      <Field
        id="outra"
        label="Mais alguma coisa"
        className="mt-[18px] animate-entra"
        style={{ animationDelay: "520ms" }}
        placeholder="Ex.: camarão, pimenta, leite de vaca"
        value={respostas.otherRestriction}
        onChange={(e) => atualizar("otherRestriction", e.target.value)}
      />
    </OnboardingStep>
  );
}
