"use client";

import Link from "next/link";
import { useId } from "react";
import { Selo } from "@/components/ui/Selo";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AlimentoBusca } from "../tipos";

/** Setas sobem e descem entre as opções da lista (teclado). */
function moverFoco(e: React.KeyboardEvent<HTMLUListElement>) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  const opcoes = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-opcao]"));
  const atual = opcoes.indexOf(document.activeElement as HTMLButtonElement);
  const proxima = e.key === "ArrowDown" ? Math.min(opcoes.length - 1, atual + 1) : Math.max(0, atual - 1);
  opcoes[proxima]?.focus();
  e.preventDefault();
}

const porCem = (a: AlimentoBusca) => `${Math.round(a.per100.calories)} kcal em 100 ${a.measure}`;

/** Passo "Buscar" — campo com foco, recentes no vazio, selos de restrição e "Seu" (RF33). */
export function FoodSearchStep({ termo, aoMudarTermo, resultados, recentes, carregando, aoEscolher, aoEditarProprio, aoCadastrar, nutriHref }: {
  termo: string; aoMudarTermo: (t: string) => void; resultados: AlimentoBusca[] | undefined; recentes: AlimentoBusca[] | undefined;
  carregando: boolean; aoEscolher: (a: AlimentoBusca) => void; aoEditarProprio: (a: AlimentoBusca) => void; aoCadastrar: () => void; nutriHref: string;
}) {
  const id = useId();
  const buscando = termo.trim().length >= 2;
  const lista = buscando ? resultados : recentes;

  return (
    <div>
      <label htmlFor={id} className="sr-only">Buscar alimento</label>
      <input id={id} type="search" autoFocus value={termo} onChange={(e) => aoMudarTermo(e.target.value)} placeholder="Buscar alimento"
        className="h-12 w-full rounded-full border border-linha bg-papel px-5 text-[15px] outline-none focus:border-tinta" />

      {!buscando && lista && lista.length > 0 ? <h3 className="mt-4 text-[13px] font-semibold text-fumo">Você costuma comer</h3> : null}
      {carregando && buscando && !resultados ? (
        <div className="mt-3 space-y-2"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
      ) : null}

      {lista && lista.length > 0 ? (
        <ul aria-label={buscando ? "Resultados" : "Você costuma comer"} className="mt-2 list-none" onKeyDown={moverFoco}>
          {lista.map((a) => (
            <li key={`${a.kind}-${a.id}`} className="flex items-center border-b border-fio last:border-b-0">
              <button type="button" data-opcao onClick={() => aoEscolher(a)} className="min-w-0 flex-1 py-3 text-left">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[15px] font-semibold">{a.name}</span>
                  {a.kind === "custom" ? <Selo tom="mata">Seu</Selo> : null}
                  {a.conflicts.map((c) => <Selo key={c} tom="alerta">{c}</Selo>)}
                </span>
                <span className="block text-[12.5px] text-fumo">{porCem(a)}</span>
              </button>
              {a.kind === "custom" ? (
                <button type="button" onClick={() => aoEditarProprio(a)} className="h-11 px-2 text-[13px] font-semibold text-mata" aria-label={`Editar ${a.name}`}>Editar</button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {buscando && resultados && resultados.length === 0 ? (
        <div className="mt-5">
          <p className="text-[14px] font-medium">Não achamos &quot;{termo.trim()}&quot;.</p>
          <div className="mt-3 flex flex-col items-start gap-2">
            <button type="button" onClick={aoCadastrar} className="h-11 rounded-full bg-tinta px-5 text-sm font-semibold text-neve">Cadastrar alimento</button>
            <Link href={nutriHref} className="text-sm font-semibold text-mata">Perguntar ao Nutri o que mais se parece</Link>
          </div>
        </div>
      ) : null}

      {buscando && resultados && resultados.length > 0 ? (
        <button type="button" onClick={aoCadastrar} className="mt-3 text-[13px] font-semibold text-mata">Não está aqui? Cadastrar alimento</button>
      ) : null}
    </div>
  );
}
