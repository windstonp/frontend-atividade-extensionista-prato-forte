"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { NutriBar } from "@/components/app/NutriBar";
import { Button } from "@/components/ui/Button";
import { RailSimples } from "@/components/ui/Rail";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { IconeCheck } from "@/components/icons";
import { getSubstitutions } from "@/lib/mock-api";
import { gramas, kcal, porcentagem } from "@/lib/format";
import { totaisDaRefeicao } from "@/lib/nutrition";
import { usePlan } from "@/lib/plan-store";
import { cascata } from "@/lib/motion";
import { CountUp } from "@/components/ui/CountUp";
import type { FoodItem, Substitution } from "@/lib/types";

export default function DetalheRefeicao() {
  const { refeicao } = useParams<{ refeicao: string }>();
  const {
    carregando, plan, profile, ultimaAlteracao,
    alternarRefeicao, substituirAlimento, desfazer, limparAviso,
  } = usePlan();

  const [alvo, setAlvo] = useState<FoodItem | null>(null);
  const [opcoes, setOpcoes] = useState<Substitution[] | null>(null);
  const [escolhida, setEscolhida] = useState<string | null>(null);

  useEffect(() => {
    if (!alvo) return;
    setOpcoes(null);
    setEscolhida(null);
    let vivo = true;
    getSubstitutions(alvo.id).then((lista) => {
      if (!vivo) return;
      setOpcoes(lista);
      setEscolhida(lista[0]?.id ?? null);
    });
    return () => {
      vivo = false;
    };
  }, [alvo]);

  if (carregando || !plan || !profile) {
    return (
      <Screen>
        <TopBar voltarPara="/dieta" rotuloVoltar="Voltar para a dieta" />
        <main className="flex-1 px-5 pt-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="mt-4 h-[180px] rounded-3xl" />
          <Skeleton className="mt-5 h-[300px] rounded-3xl" />
        </main>
      </Screen>
    );
  }

  const meal = plan.meals.find((m) => m.id === refeicao);

  if (!meal) {
    return (
      <Screen>
        <TopBar voltarPara="/dieta" rotuloVoltar="Voltar para a dieta" />
        <main className="flex-1 px-5 pt-6">
          <h1 className="font-display text-2xl font-bold">Refeição não encontrada</h1>
          <p className="mt-2 text-sm text-fumo">
            Esse horário não está no seu plano de hoje.
          </p>
          <Link href="/dieta" className="mt-4 inline-block text-sm font-semibold text-mata">
            Ver as refeições de hoje
          </Link>
        </main>
      </Screen>
    );
  }

  const { calories, macros } = totaisDaRefeicao(meal);
  const proxima = plan.meals.find((m) => !m.done)?.id === meal.id;
  const fatiaDoDia = Math.round(porcentagem(calories, plan.targetCalories));
  const substituicaoEscolhida = opcoes?.find((o) => o.id === escolhida);

  return (
    <Screen>
      <TopBar
        voltarPara="/dieta"
        rotuloVoltar="Voltar para a dieta"
        direita={
          meal.done ? (
            <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full bg-mata-fraca px-3 text-[11.5px] font-semibold text-mata-texto">
              <IconeCheck size={12} strokeWidth={2.4} />
              Refeição feita
            </span>
          ) : proxima ? (
            <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full bg-gema-fraca px-3">
              <span className="size-1.5 rounded-full bg-gema" />
              <span className="text-[11.5px] font-semibold text-gema-texto">
                Próxima refeição
              </span>
            </span>
          ) : null
        }
      />

      {ultimaAlteracao ? (
        <Toast
          texto={ultimaAlteracao.texto}
          acao={{ rotulo: "Desfazer", onClick: desfazer }}
          aoExpirar={limparAviso}
        />
      ) : null}

      <main className="flex-1 px-5 pt-3">
        <h1 className="animate-entra font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em]">
          {meal.name}
        </h1>
        <p
          className="mt-1.5 animate-entra text-[13.5px] text-fumo"
          style={{ animationDelay: "80ms" }}
        >
          Hoje às {meal.time}
          {meal.note ? `, ${meal.note.toLowerCase()}` : ""}
        </p>

        <section
          className="mt-4 animate-escala rounded-[20px] bg-white px-[18px] py-4"
          style={{ animationDelay: "140ms" }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-4xl font-bold tracking-[-0.03em]">
              <CountUp valor={Math.round(calories)} duracao={1000} />{" "}
              <span className="text-[17px] font-semibold tracking-normal text-fumo">kcal</span>
            </p>
            <span className="shrink-0 text-[12.5px] text-fumo">{fatiaDoDia}% do seu dia</span>
          </div>

          <div className="mt-3.5 border-t border-fio pt-3.5">
            <RailSimples
              rotulo="Proteína"
              valor={gramas(macros.protein)}
              proporcao={porcentagem(macros.protein, plan.targetMacros.protein)}
              cor="bg-tinta"
              atraso={320}
            />
            <RailSimples
              rotulo="Carboidrato"
              valor={gramas(macros.carbs)}
              proporcao={porcentagem(macros.carbs, plan.targetMacros.carbs)}
              cor="bg-gema"
              atraso={400}
            />
            <RailSimples
              rotulo="Gordura"
              valor={gramas(macros.fat)}
              proporcao={porcentagem(macros.fat, plan.targetMacros.fat)}
              cor="bg-mata"
              atraso={480}
            />
            <p className="mt-2.5 text-xs text-fumo">
              As barras mostram quanto esta refeição cobre da sua meta do dia.
            </p>
          </div>
        </section>

        <h2
          className="mt-5 animate-entra font-display text-[15px] font-semibold"
          style={{ animationDelay: "300ms" }}
        >
          O que vai no prato
        </h2>

        <ul className="mt-2.5 list-none rounded-[20px] bg-white px-[18px]">
          {meal.items.map((item, i) => (
            <li
              key={item.id}
              style={cascata(i, 65, 360)}
              className={`flex animate-entra-lado-esq items-start gap-3 py-[15px] ${
                i < meal.items.length - 1 ? "border-b border-fio" : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold tracking-[-0.01em]">
                    {item.name}
                  </span>
                  {item.replacedFrom ? (
                    <span className="inline-flex h-[22px] animate-pop items-center rounded-full bg-mata-fraca px-2.5 text-[11px] font-semibold text-mata-texto">
                      Trocado
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[13px] text-fumo">{item.amount}</p>
                <p className="mt-1 text-xs text-fumo">
                  <b className="font-semibold text-[#3d4a42]">{kcal(item.calories)}</b>
                  {item.macros.protein >= 1
                    ? `   ${gramas(item.macros.protein)} proteína`
                    : ""}
                  {item.macros.carbs >= 1 ? `   ${gramas(item.macros.carbs)} carbo` : ""}
                  {item.macros.fat >= 5 ? `   ${gramas(item.macros.fat)} gordura` : ""}
                </p>
                {item.replacedFrom ? (
                  <p className="mt-1 text-xs text-fumo">No lugar de {item.replacedFrom.toLowerCase()}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setAlvo(item)}
                className="flex h-11 shrink-0 items-center rounded-full border-[1.5px] border-linha px-4 text-[13px] font-semibold transition-[border-color,background-color,transform] duration-250 hover:-translate-y-px hover:border-tinta hover:bg-white active:scale-95"
              >
                Trocar
                <span className="sr-only"> {item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      <footer
        className="flex shrink-0 animate-entra flex-col gap-2.5 px-5 pt-3.5 pb-7 area-segura-baixo"
        style={{ animationDelay: "560ms" }}
      >
        <NutriBar
          texto={`Não tenho ${meal.items[2]?.name.toLowerCase() ?? "um dos alimentos"} em casa`}
        />
        <Button
          variante={meal.done ? "contorno" : "primaria"}
          onClick={() => alternarRefeicao(meal.id)}
        >
          {meal.done ? "Desmarcar refeição" : "Marcar como feita"}
        </Button>
      </footer>

      <Sheet
        aberta={Boolean(alvo)}
        aoFechar={() => setAlvo(null)}
        titulo={`Trocar ${alvo?.name.toLowerCase() ?? ""}`}
        descricao={
          alvo
            ? `${alvo.amount} trazem ${gramas(alvo.macros.carbs)} de carboidrato e ${gramas(alvo.macros.protein)} de proteína. Estas opções chegam perto e mantêm o resto do prato igual.`
            : undefined
        }
      >
        {opcoes === null ? (
          <div className="mt-4 flex flex-col gap-2">
            <Skeleton className="h-[86px]" />
            <Skeleton className="h-[86px]" />
            <Skeleton className="h-[86px]" />
          </div>
        ) : opcoes.length === 0 ? (
          <div className="mt-4">
            <p className="text-sm leading-normal text-fumo">
              Ainda não temos trocas cadastradas para este alimento. O Nutri consegue
              sugerir uma a partir do que você tem em casa.
            </p>
            <Link
              href="/nutri"
              className="mt-4 flex h-[54px] items-center justify-center rounded-full bg-gema text-base font-semibold text-tinta"
            >
              Perguntar ao Nutri
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Opções de troca">
              {opcoes.map((o, i) => {
                const marcada = o.id === escolhida;
                const delta = o.calories - (alvo?.calories ?? 0);
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={marcada}
                    onClick={() => setEscolhida(o.id)}
                    style={cascata(i, 55, 80)}
                    className={`flex w-full animate-entra items-start gap-3 rounded-2xl border bg-white px-[15px] py-[13px] text-left transition-[border-color,box-shadow,transform] duration-250 active:scale-[0.99] ${
                      marcada
                        ? "border-tinta shadow-[inset_0_0_0_1px_var(--color-tinta)]"
                        : "border-linha hover:-translate-y-px hover:border-pedra"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-[background-color,border-color,transform] duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] ${
                        marcada ? "scale-110 border-tinta bg-tinta" : "border-[#c3ccc0]"
                      }`}
                    >
                      <span
                        className={`block size-2 rounded-full bg-gema transition-transform duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] ${
                          marcada ? "scale-100" : "scale-0"
                        }`}
                      />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-2.5">
                        <span className="text-[15px] font-semibold tracking-[-0.01em]">
                          {o.name}
                        </span>
                        <span
                          className={`shrink-0 text-[12.5px] font-semibold ${
                            delta <= 0 ? "text-mata" : "text-fumo"
                          }`}
                        >
                          {delta > 0 ? "+" : "−"}
                          {Math.abs(Math.round(delta))} kcal
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[13px] text-fumo">{o.amount}</span>
                      <span className="mt-1 block text-xs text-fumo">
                        {gramas(o.macros.carbs)} de carboidrato. {o.note}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="mt-3.5 flex animate-entra items-start gap-2.5 rounded-[14px] bg-mata-fraca px-3.5 py-3"
              style={{ animationDelay: "320ms" }}
            >
              <IconeCheck size={17} strokeWidth={1.9} className="mt-0.5 shrink-0 text-mata" />
              <span className="text-[12.5px] leading-snug text-mata-texto">
                Nenhuma dessas opções tem{" "}
                {profile.restrictions[0]?.label.toLowerCase() ?? "o que você não pode comer"}.
              </span>
            </div>

            <div
              className="mt-4 flex animate-entra flex-col gap-2"
              style={{ animationDelay: "380ms" }}
            >
              <Button
                onClick={() => {
                  if (alvo && substituicaoEscolhida) {
                    substituirAlimento(meal.id, alvo.id, substituicaoEscolhida);
                  }
                  setAlvo(null);
                }}
                disabled={!substituicaoEscolhida}
              >
                Usar {substituicaoEscolhida?.name.toLowerCase() ?? "esta opção"}
              </Button>
              <button
                type="button"
                onClick={() => setAlvo(null)}
                className="flex h-12 items-center justify-center text-[14.5px] font-semibold text-fumo"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </Sheet>
    </Screen>
  );
}
