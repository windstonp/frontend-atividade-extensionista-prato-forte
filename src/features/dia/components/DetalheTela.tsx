"use client";

import { useState } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/app/ErrorState";
import { NutriBar } from "@/components/app/NutriBar";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { IconeCheck } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { RailSimples } from "@/components/ui/Rail";
import { Skeleton } from "@/components/ui/Skeleton";
import { comoApiError } from "@/lib/api/errors";
import { gramas, porcentagem } from "@/lib/format";
import { useDia, useMarcandoRefeicao, useMarcarRefeicao, useSubstituicoes, useTentarPlanoDeNovo, useTrocarItem } from "../hooks";
import { estadoSemPlano, planoSemAtivo } from "../regras";
import type { ItemDoDia } from "../tipos";
import { AvisoDeAlteracao } from "./AvisoDeAlteracao";
import { FoodItemRow } from "./FoodItemRow";
import { NoPlanState } from "./NoPlanState";
import { SubstitutionSheet } from "./SubstitutionSheet";
import { Selo } from "@/components/ui/Selo";

/** S13 — uma refeição de hoje: o que vai no prato, trocas (RF14), desfazer (RF15) e marcar (RF13). */
export function DetalheTela({ slot }: { slot: string }) {
  const dia = useDia();
  const marcar = useMarcarRefeicao();
  const trocar = useTrocarItem();
  const [alvo, setAlvo] = useState<ItemDoDia | null>(null);
  const opcoes = useSubstituicoes(alvo?.id ?? null);
  const marcando = useMarcandoRefeicao();
  const plano = useTentarPlanoDeNovo("/dieta");
  const semPlano = planoSemAtivo(dia.error);

  if (semPlano) {
    return (
      <Screen>
        <TopBar voltarPara="/dieta" rotuloVoltar="Voltar para a dieta" />
        <main className="flex-1 px-5 pt-3">
          <NoPlanState
            estado={estadoSemPlano(semPlano.status)}
            planId={semPlano.planId}
            tentando={plano.tentando}
            aoTentarDeNovo={() => void plano.tentar()}
          />
        </main>
      </Screen>
    );
  }

  if (dia.isError && !dia.data) {
    return (
      <Screen>
        <TopBar voltarPara="/dieta" rotuloVoltar="Voltar para a dieta" />
        <main className="flex-1 px-5 pt-3">
          <ErrorState
            titulo="Não foi possível carregar sua refeição"
            descricao="Seu plano está salvo. Só a conexão falhou agora."
            aoTentarDeNovo={() => void dia.refetch()}
          />
        </main>
      </Screen>
    );
  }

  if (!dia.data) {
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

  const refeicao = dia.data.meals.find((m) => m.slot === slot);

  if (!refeicao) {
    return (
      <Screen>
        <TopBar voltarPara="/dieta" rotuloVoltar="Voltar para a dieta" />
        <main className="flex-1 px-5 pt-6">
          <h1 className="font-display text-2xl font-bold">Refeição não encontrada</h1>
          <p className="mt-2 text-sm text-fumo">Esse horário não está no seu plano de hoje.</p>
          <Link href="/dieta" className="mt-4 inline-block text-sm font-semibold text-mata">
            Ver as refeições de hoje
          </Link>
        </main>
      </Screen>
    );
  }

  const { targets, totals, lastChange } = dia.data;
  const metas = targets ?? { kcal: totals.planned.calories, proteinG: totals.planned.protein, carbsG: totals.planned.carbs, fatG: totals.planned.fat };
  const proteico = [...refeicao.items].sort((a, b) => b.macros.protein - a.macros.protein)[0];

  function usar(foodId: number) {
    if (!alvo?.id) return;
    trocar.mutate(
      { itemId: alvo.id, foodId },
      {
        onSuccess: () => setAlvo(null),
        onError: (e) => {
          if (comoApiError(e).code === "SUBSTITUTION_NOT_ALLOWED") void opcoes.refetch();
        },
      },
    );
  }

  return (
    <Screen>
      <TopBar
        voltarPara="/dieta"
        rotuloVoltar="Voltar para a dieta"
        direita={
          refeicao.done ? (
            <Selo tom="mata" icone={<IconeCheck size={12} strokeWidth={2.4} />}>
              Refeição feita
            </Selo>
          ) : refeicao.isNext ? (
            <Selo tom="gema" pulsante>
              Próxima refeição
            </Selo>
          ) : null
        }
      />

      <AvisoDeAlteracao alteracao={lastChange} />

      <main className="flex-1 px-5 pt-3">
        <h1 className="animate-entra font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em]">{refeicao.name}</h1>
        <p className="mt-1.5 animate-entra text-[13.5px] text-fumo" style={{ animationDelay: "80ms" }}>
          Hoje às {refeicao.time}
          {refeicao.note ? `, ${refeicao.note.toLowerCase()}` : ""}
        </p>

        <section className="mt-4 animate-escala rounded-[20px] bg-white px-[18px] py-4" style={{ animationDelay: "140ms" }}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-4xl font-bold tracking-[-0.03em]">
              <CountUp valor={Math.round(refeicao.calories)} duracao={1000} />{" "}
              <span className="text-[17px] font-semibold tracking-normal text-fumo">kcal</span>
            </p>
            <span className="shrink-0 text-[12.5px] text-fumo">{Math.round(porcentagem(refeicao.calories, metas.kcal))}% do seu dia</span>
          </div>

          <div className="mt-3.5 border-t border-fio pt-3.5">
            <RailSimples rotulo="Proteína" valor={gramas(refeicao.macros.protein)} proporcao={porcentagem(refeicao.macros.protein, metas.proteinG)} cor="bg-tinta" atraso={320} />
            <RailSimples rotulo="Carboidrato" valor={gramas(refeicao.macros.carbs)} proporcao={porcentagem(refeicao.macros.carbs, metas.carbsG)} cor="bg-gema" atraso={400} />
            <RailSimples rotulo="Gordura" valor={gramas(refeicao.macros.fat)} proporcao={porcentagem(refeicao.macros.fat, metas.fatG)} cor="bg-mata" atraso={480} />
            <p className="mt-2.5 text-xs text-fumo">As barras mostram quanto esta refeição cobre da sua meta do dia.</p>
          </div>
        </section>

        <h2 className="mt-5 animate-entra font-display text-[15px] font-semibold" style={{ animationDelay: "300ms" }}>
          O que vai no prato
        </h2>

        <ul className="mt-2.5 list-none rounded-[20px] bg-white px-[18px]">
          {refeicao.items.map((item, i) => (
            <FoodItemRow
              key={item.id ?? `${item.foodId}-${i}`}
              item={item}
              indice={i}
              ultimo={i === refeicao.items.length - 1}
              aoTrocar={item.id !== null && dia.data.editable ? () => setAlvo(item) : undefined}
            />
          ))}
        </ul>
      </main>

      <footer className="flex shrink-0 animate-entra flex-col gap-2.5 px-5 pt-3.5 pb-7 area-segura-baixo" style={{ animationDelay: "560ms" }}>
        {proteico ? (
          <NutriBar
            href={`/nutri?pergunta=${encodeURIComponent(`Não tenho ${proteico.name.toLowerCase()} em casa. O que uso no lugar?`)}`}
            texto={`Não tenho ${proteico.name.toLowerCase()} em casa`}
          />
        ) : null}
        <Button variante={refeicao.done ? "contorno" : "primaria"} disabled={marcando} onClick={() => marcar.mutate({ slot: refeicao.slot, done: !refeicao.done })}>
          {refeicao.done ? "Desmarcar refeição" : "Marcar como feita"}
        </Button>
      </footer>

      <SubstitutionSheet
        item={alvo}
        substituicoes={opcoes.data}
        carregando={opcoes.isPending && alvo !== null}
        erro={opcoes.isError}
        trocando={trocar.isPending}
        aoTentarDeNovo={() => void opcoes.refetch()}
        aoTrocar={usar}
        aoFechar={() => setAlvo(null)}
      />
    </Screen>
  );
}
