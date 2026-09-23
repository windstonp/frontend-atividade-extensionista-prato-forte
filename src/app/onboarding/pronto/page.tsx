"use client";

import { Screen } from "@/components/app/Screen";
import { ButtonLink } from "@/components/ui/Button";
import { IconeCheck } from "@/components/icons";
import { mockDayPlan } from "@/lib/mock-data";
import { kcal } from "@/lib/format";
import { totaisDaRefeicao } from "@/lib/nutrition";
import { useOnboarding } from "@/lib/onboarding-store";
import { cascata } from "@/lib/motion";

export default function Pronto() {
  const { respostas } = useOnboarding();
  const nome = respostas.name.trim();
  const { targetMacros, meals } = mockDayPlan;

  return (
    <Screen>
      <main className="flex-1 px-6 pt-16 area-segura-cima">
        <span className="relative flex size-11 items-center justify-center rounded-full bg-mata text-white">
          <span className="absolute inset-0 animate-halo rounded-full bg-mata" />
          <span className="relative flex animate-pop items-center justify-center">
            <IconeCheck size={22} strokeWidth={2.1} />
          </span>
        </span>

        <h1
          className="mt-[22px] animate-entra font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em]"
          style={{ animationDelay: "160ms" }}
        >
          Seu plano está pronto{nome ? `, ${nome}` : ""}
        </h1>
        <p
          className="mt-3 animate-entra text-[15px] leading-relaxed text-fumo"
          style={{ animationDelay: "260ms" }}
        >
          Cinco refeições montadas com o que você marcou, encaixadas entre o trabalho e
          o treino das {respostas.trainingTime}.
        </p>

        <section
          className="mt-[22px] animate-escala rounded-[20px] bg-white px-[18px] pt-1.5 pb-3.5"
          style={{ animationDelay: "340ms" }}
        >
          <div className="flex items-baseline justify-between py-3.5">
            <h2 className="font-display text-[15px] font-semibold">Um dia comum</h2>
            <span className="text-[12.5px] text-fumo">{kcal(mockDayPlan.targetCalories)}</span>
          </div>
          {meals.map((meal, i) => (
            <div
              key={meal.id}
              style={cascata(i, 70, 460)}
              className={`flex min-h-[52px] animate-entra-lado-esq items-center gap-3 ${
                i < meals.length - 1 ? "border-b border-fio" : ""
              }`}
            >
              <span className="w-[46px] text-[12.5px] text-fumo">{meal.time}</span>
              <span className="flex-1 text-[14.5px] font-medium">{meal.name}</span>
              <span className="text-[12.5px] text-fumo">
                {kcal(totaisDaRefeicao(meal).calories)}
              </span>
            </div>
          ))}
          <div
            className="mt-1 flex animate-entra gap-[18px] border-t border-tinta pt-3.5"
            style={{ animationDelay: "840ms" }}
          >
            <span className="text-[13px] font-semibold">
              {targetMacros.protein} g <span className="font-medium text-fumo">proteína</span>
            </span>
            <span className="text-[13px] font-semibold">
              {targetMacros.carbs} g <span className="font-medium text-fumo">carboidrato</span>
            </span>
            <span className="text-[13px] font-semibold">
              {targetMacros.fat} g <span className="font-medium text-fumo">gordura</span>
            </span>
          </div>
        </section>

        <p
          className="mt-4 animate-entra text-[13.5px] leading-normal text-fumo"
          style={{ animationDelay: "920ms" }}
        >
          Faltou algum alimento ou o horário não bate? O Nutri ajusta qualquer refeição
          em segundos.
        </p>
      </main>

      <footer
        className="flex shrink-0 animate-entra flex-col gap-3 px-6 pt-3.5 pb-8 area-segura-baixo"
        style={{ animationDelay: "1000ms" }}
      >
        <ButtonLink href="/hoje">Ver o dia de hoje</ButtonLink>
        <ButtonLink href="/nutri" variante="texto" className="h-11">
          Ajustar alguma coisa com o Nutri
        </ButtonLink>
      </footer>
    </Screen>
  );
}
