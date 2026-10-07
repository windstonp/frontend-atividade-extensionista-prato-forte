"use client";

import { useState } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/app/ErrorState";
import { NutriBar } from "@/components/app/NutriBar";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { IconeCheck } from "@/components/icons";
import { Selo } from "@/components/ui/Selo";
import { Skeleton } from "@/components/ui/Skeleton";
import { comoApiError } from "@/lib/api/errors";
import { useDia, useRegistrando, useRegistrar, useSubstituicoes, useTentarPlanoDeNovo, useTrocarItem } from "../hooks";
import { metaDaRefeicao } from "../registro";
import { estadoSemPlano, planoSemAtivo } from "../regras";
import type { ItemDoDia, Registro } from "../tipos";
import { AddFoodSheet } from "./AddFoodSheet";
import { AvisoDeAlteracao } from "./AvisoDeAlteracao";
import { EntryList } from "./EntryList";
import { MealGoal } from "./MealGoal";
import { NoPlanState } from "./NoPlanState";
import { SubstitutionSheet } from "./SubstitutionSheet";
import { SuggestionList } from "./SuggestionList";

type Folha = { tipo: "novo" } | { tipo: "editar"; registro: Registro };

/**
 * S13 (spec 09) — o que eu comi × a sugestão: régua da meta, registros, sugestão com +,
 * trocas (só hoje) e desfazer. Hoje, ou ontem com `data`.
 */
export function DetalheTela({ slot, data }: { slot: string; data?: string }) {
  const chave = data ?? "today";
  const dia = useDia(chave);
  const registrar = useRegistrar(chave);
  const registrando = useRegistrando();
  const trocar = useTrocarItem();
  const [alvo, setAlvo] = useState<ItemDoDia | null>(null);
  const [folha, setFolha] = useState<Folha | null>(null);
  const opcoes = useSubstituicoes(alvo?.id ?? null);
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
          <Skeleton className="mt-4 h-[200px] rounded-3xl" />
          <Skeleton className="mt-5 h-[160px] rounded-3xl" />
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

  const { editable, isToday, lastChange } = dia.data;
  const meta = metaDaRefeicao(refeicao);
  const proteico = [...refeicao.items].sort((a, b) => b.macros.protein - a.macros.protein)[0];
  const quando = `${isToday ? "Hoje" : "Ontem"} às ${refeicao.time}${refeicao.note ? `, ${refeicao.note.toLowerCase()}` : ""}`;
  const registrarItens = (itens: ItemDoDia[]) =>
    registrar.mutate({ slot: refeicao.slot, entries: itens.map((i) => ({ suggestionItemId: i.id as number })) });

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
          refeicao.goalMet ? (
            <Selo tom="mata" icone={<IconeCheck size={12} strokeWidth={2.4} />}>
              Meta batida
            </Selo>
          ) : refeicao.isNext ? (
            <Selo tom="gema" pulsante>
              Próxima refeição
            </Selo>
          ) : null
        }
      />

      <AvisoDeAlteracao alteracao={isToday ? lastChange : null} />

      <main className="flex-1 px-5 pt-3 pb-4">
        <h1 className="animate-entra font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em]">{refeicao.name}</h1>
        <p className="mt-1.5 mb-4 animate-entra text-[13.5px] text-fumo" style={{ animationDelay: "80ms" }}>
          {quando}
        </p>

        <MealGoal meta={meta} consumido={refeicao.consumed} temRegistro={refeicao.entries.length > 0} />

        <EntryList
          registros={refeicao.entries}
          aoAbrir={editable ? (r) => setFolha({ tipo: "editar", registro: r }) : undefined}
          aoAdicionar={editable ? () => setFolha({ tipo: "novo" }) : undefined}
        />

        <SuggestionList
          itens={refeicao.items}
          ocupado={registrando}
          aoRegistrar={editable ? (i) => registrarItens([i]) : undefined}
          aoRegistrarTodos={editable ? registrarItens : undefined}
          aoTrocar={editable && isToday ? (i) => setAlvo(i) : undefined}
        />
      </main>

      {proteico && editable ? (
        <footer className="shrink-0 px-5 pt-2 pb-seguro-7">
          <NutriBar
            href={`/nutri?pergunta=${encodeURIComponent(`Não tenho ${proteico.name.toLowerCase()} em casa. O que uso no lugar?`)}`}
            texto={`Não tenho ${proteico.name.toLowerCase()} em casa`}
          />
        </footer>
      ) : null}

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
      <AddFoodSheet aberta={folha !== null} modo={folha ?? { tipo: "novo" }} slot={refeicao.slot} dataChave={chave} aoFechar={() => setFolha(null)} />
    </Screen>
  );
}
