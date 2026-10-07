"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { comoApiError } from "@/lib/api/errors";
import { useApagarAlimentoProprio, useBuscaAlimentos, useCriarAlimentoProprio, useEditarAlimentoProprio, useEditarRegistro, useRecentes, useRegistrar, useRemoverRegistro } from "../hooks";
import { atalhosDeQuantidade, per100DoRegistro } from "../registro";
import type { AlimentoBusca, AlimentoProprioDados, Registro, Slot } from "../tipos";
import { AmountStep } from "./AmountStep";
import { CustomFoodForm } from "./CustomFoodForm";
import { FoodSearchStep } from "./FoodSearchStep";

type Passo = { tipo: "buscar" } | { tipo: "quantidade"; alimento: AlimentoBusca } | { tipo: "proprio"; alimento?: AlimentoBusca };

/** S13a — buscar → quantidade → adicionar; cadastrar/editar alimento próprio; editar/remover registro. */
export function AddFoodSheet({ aberta, modo, slot, dataChave, aoFechar }: {
  aberta: boolean; modo: { tipo: "novo" } | { tipo: "editar"; registro: Registro }; slot: Slot; dataChave: string; aoFechar: () => void;
}) {
  const [passo, setPasso] = useState<Passo>({ tipo: "buscar" });
  const [termo, setTermo] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const busca = useBuscaAlimentos(termo);
  const recentes = useRecentes(aberta && modo.tipo === "novo");
  const registrar = useRegistrar(dataChave);
  const editar = useEditarRegistro(dataChave);
  const remover = useRemoverRegistro(dataChave);
  const criar = useCriarAlimentoProprio();
  const editarProprio = useEditarAlimentoProprio();
  const apagarProprio = useApagarAlimentoProprio();

  function fechar() {
    setPasso({ tipo: "buscar" });
    setTermo("");
    setErros({});
    aoFechar();
  }

  function errosDe(e: unknown) {
    // As chaves já chegam em camelCase ("per_100.calories" → "per100.calories").
    setErros(Object.fromEntries(Object.entries(comoApiError(e).fieldErrors).map(([k, v]) => [k, v[0]])));
  }

  async function salvarProprio(d: AlimentoProprioDados, alimento?: AlimentoBusca) {
    try {
      const salvo = alimento
        ? ((await editarProprio.mutateAsync({ id: alimento.id, dados: d })) as AlimentoBusca)
        : ((await criar.mutateAsync(d)) as AlimentoBusca);
      setErros({});
      setPasso({ tipo: "quantidade", alimento: salvo });
    } catch (e) {
      errosDe(e);
    }
  }

  let titulo = "Adicionar alimento";
  let conteudo: React.ReactNode;
  if (modo.tipo === "editar") {
    const r = modo.registro;
    titulo = "Editar registro";
    conteudo = (
      <AmountStep key={`registro-${r.id}`} nome={r.name} medida={r.measure} per100={per100DoRegistro(r)} atalhos={[]} conflitos={r.conflicts} inicial={r.amount} modo="editar"
        salvando={editar.isPending}
        aoConfirmar={(amount) => editar.mutate({ id: r.id, amount }, { onSuccess: fechar })}
        aoRemover={() => remover.mutate({ registro: r, slot }, { onSuccess: fechar })} />
    );
  } else if (passo.tipo === "quantidade") {
    const a = passo.alimento;
    conteudo = (
      <AmountStep key={`${a.kind}-${a.id}`} nome={a.name} medida={a.measure} per100={a.per100} atalhos={atalhosDeQuantidade(a)} conflitos={a.conflicts} modo="adicionar"
        salvando={registrar.isPending}
        aoConfirmar={(amount) => registrar.mutate({ slot, entries: [a.kind === "custom" ? { customFoodId: a.id, amount } : { foodId: a.id, amount }] }, { onSuccess: fechar })}
        aoVoltar={() => setPasso({ tipo: "buscar" })}
        aoEditarAlimento={a.kind === "custom" ? () => setPasso({ tipo: "proprio", alimento: a }) : undefined} />
    );
  } else if (passo.tipo === "proprio") {
    const a = passo.alimento;
    conteudo = (
      <CustomFoodForm
        key={a ? `proprio-${a.id}` : "novo"}
        inicial={a ? { id: a.id, name: a.name, measure: a.measure, per100: a.per100 } : { name: termo.trim() }}
        salvando={criar.isPending || editarProprio.isPending} erros={erros}
        aoSalvar={(d) => void salvarProprio(d, a)}
        aoApagar={a ? () => apagarProprio.mutate(a.id, { onSuccess: () => setPasso({ tipo: "buscar" }) }) : undefined}
        aoVoltar={() => setPasso({ tipo: "buscar" })} />
    );
  } else {
    conteudo = (
      <FoodSearchStep termo={termo} aoMudarTermo={setTermo} resultados={busca.data} recentes={recentes.data} carregando={busca.isFetching}
        aoEscolher={(a) => setPasso({ tipo: "quantidade", alimento: a })}
        aoEditarProprio={(a) => setPasso({ tipo: "proprio", alimento: a })}
        aoCadastrar={() => setPasso({ tipo: "proprio" })}
        nutriHref={`/nutri?pergunta=${encodeURIComponent(`Comi ${termo.trim()} e não achei no app. O que mais se parece?`)}`} />
    );
  }

  return <Sheet aberta={aberta} aoFechar={fechar} titulo={titulo}>{conteudo}</Sheet>;
}
