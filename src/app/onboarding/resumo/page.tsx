"use client";

import Link from "next/link";
import { OnboardingStep } from "@/components/app/OnboardingStep";
import { useOnboarding } from "@/lib/onboarding-store";
import { cascata } from "@/lib/motion";
import {
  ALERGIAS,
  ALMOCO,
  ATIVIDADES,
  DIAS_CURTOS,
  OBJETIVOS,
  RESTRICOES,
} from "@/lib/labels";

export default function Resumo() {
  const { respostas } = useOnboarding();

  const nome = respostas.name.trim() || "Você";
  const idade = respostas.age || "—";
  const altura = respostas.heightCm ? `${respostas.heightCm} cm` : "—";
  const peso = respostas.weightKg ? `${respostas.weightKg} kg` : "—";
  const dias = respostas.trainingDays.map((d) => DIAS_CURTOS[d]).join(", ") || "nenhum dia";

  const restricoesMarcadas = respostas.restrictions.map((r) => RESTRICOES[r] ?? r);
  if (respostas.otherRestriction.trim()) restricoesMarcadas.push(respostas.otherRestriction.trim());
  const temAlergia = respostas.restrictions.some((r) => ALERGIAS.has(r));

  const linhas = [
    { rotulo: "Objetivo", valor: OBJETIVOS[respostas.goal], editar: "/onboarding/objetivo" },
    {
      rotulo: "Você",
      valor: `${nome}, ${idade} anos, ${altura}, ${peso}`,
      editar: "/onboarding/dados",
    },
    {
      rotulo: "Treino",
      valor: `${ATIVIDADES[respostas.activity]}, às ${respostas.trainingTime}`,
      editar: "/onboarding/atividade",
    },
    {
      rotulo: "Sua cozinha",
      valor: respostas.pantry.length
        ? `${respostas.pantry.length} alimentos marcados`
        : "Nada marcado ainda",
      editar: "/onboarding/preferencias",
    },
    {
      rotulo: "Restrições",
      valor: restricoesMarcadas.length ? restricoesMarcadas.join(", ") : "Nenhuma",
      editar: "/onboarding/restricoes",
      alerta: temAlergia,
    },
    {
      rotulo: "Rotina",
      valor: `Acorda ${respostas.wakeTime}, dorme ${respostas.sleepTime}, ${ALMOCO[respostas.lunchPlace]}. Treina ${dias}.`,
      editar: "/onboarding/rotina",
    },
  ];

  return (
    <OnboardingStep
      etapa={7}
      voltarPara="/onboarding/rotina"
      titulo="Confere se está certo"
      descricao="Qualquer linha pode ser ajustada agora ou depois, no perfil."
      proximo="/onboarding/gerando"
      rotuloProximo="Gerar meu plano"
    >
      <div className="rounded-[18px] bg-white px-4">
        {linhas.map((linha, i) => (
          <div
            key={linha.rotulo}
            style={cascata(i, 60, 180)}
            className={`flex min-h-[62px] animate-entra items-center gap-3 py-3 ${
              i < linhas.length - 1 ? "border-b border-fio" : ""
            }`}
          >
            <div className="flex-1">
              <span className="block text-[12.5px] text-fumo">{linha.rotulo}</span>
              <span
                className={`mt-0.5 block text-[15px] font-semibold ${
                  linha.alerta ? "text-alerta" : ""
                }`}
              >
                {linha.valor}
              </span>
            </div>
            <Link
              href={linha.editar}
              className="shrink-0 py-2 pl-3 text-[13px] font-semibold text-mata hover:text-tinta"
            >
              Editar
              <span className="sr-only"> {linha.rotulo.toLowerCase()}</span>
            </Link>
          </div>
        ))}
      </div>

      <div
        className="mt-4 animate-escala rounded-[18px] bg-tinta px-[18px] py-4 text-neve"
        style={{ animationDelay: "560ms" }}
      >
        <p className="text-[14.5px] leading-normal text-salvia">
          Com isso, seu plano começa em{" "}
          <span className="font-semibold text-gema">1.950 kcal</span> por dia, com 120 g
          de proteína divididos em 5 refeições.
        </p>
      </div>
    </OnboardingStep>
  );
}
