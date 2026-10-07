"use client";

import { useRef, useState } from "react";
import { IconeCheck } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { gramas } from "@/lib/format";
import { cascata } from "@/lib/motion";
import { juntarComE } from "../regras";
import type { ItemDoDia, Substituicoes } from "../tipos";
import { EmptyState } from "@/components/ui/EmptyState";

const delta = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n))} kcal`;

/** RF14 — trocar um alimento por um equivalente; toda opção já respeita as restrições (RN17). */
export function SubstitutionSheet({
  item,
  substituicoes,
  carregando,
  erro,
  trocando,
  aoTentarDeNovo,
  aoTrocar,
  aoFechar,
}: {
  item: ItemDoDia | null;
  substituicoes: Substituicoes | undefined;
  carregando: boolean;
  erro: boolean;
  trocando: boolean;
  aoTentarDeNovo: () => void;
  aoTrocar: (foodId: number) => void;
  aoFechar: () => void;
}) {
  return (
    <Sheet
      aberta={item !== null}
      aoFechar={aoFechar}
      titulo={`Trocar ${item?.name.toLowerCase() ?? ""}`}
      descricao={
        item
          ? `${item.amount} trazem ${gramas(item.macros.carbs)} de carboidrato e ${gramas(item.macros.protein)} de proteína. Estas opções chegam perto e mantêm o resto do prato.`
          : undefined
      }
    >
      {item === null ? null : carregando ? (
        <div className="mt-4 flex flex-col gap-2" role="status" aria-label="Buscando opções">
          <Skeleton className="h-[86px]" />
          <Skeleton className="h-[86px]" />
          <Skeleton className="h-[86px]" />
        </div>
      ) : erro || !substituicoes ? (
        <div className="mt-4 animate-balanca rounded-[14px] bg-alerta-fraca px-3.5 py-3">
          <p className="text-[13.5px] leading-normal text-alerta-texto">Não foi possível buscar as opções agora.</p>
          <Button variante="contorno" tamanho="media" className="mt-3" onClick={aoTentarDeNovo}>
            Tentar de novo
          </Button>
        </div>
      ) : substituicoes.options.length === 0 ? (
        <EmptyState
          className="mt-2 px-0 py-0"
          titulo="Sem trocas para este alimento"
          descricao="Ainda não temos trocas cadastradas para este alimento. O Nutri consegue sugerir uma a partir do que você tem em casa."
          acao={{
            rotulo: "Perguntar ao Nutri",
            href: `/nutri?pergunta=${encodeURIComponent(`Não tenho ${item.name.toLowerCase()} em casa. O que uso no lugar?`)}`,
          }}
        />
      ) : (
        <Opcoes key={item.id} substituicoes={substituicoes} trocando={trocando} aoTrocar={aoTrocar} aoFechar={aoFechar} />
      )}
    </Sheet>
  );
}

function Opcoes({
  substituicoes,
  trocando,
  aoTrocar,
  aoFechar,
}: {
  substituicoes: Substituicoes;
  trocando: boolean;
  aoTrocar: (foodId: number) => void;
  aoFechar: () => void;
}) {
  const { options, guarantee } = substituicoes;
  const [escolhida, setEscolhida] = useState(options[0].foodId);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const opcao = options.find((o) => o.foodId === escolhida) ?? options[0];

  function aoTeclar(evento: React.KeyboardEvent, indice: number) {
    const passo = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[evento.key];
    if (passo === undefined) return;
    evento.preventDefault();
    const destino = (indice + passo + options.length) % options.length;
    setEscolhida(options[destino].foodId);
    radios.current[destino]?.focus();
  }

  return (
    <>
      <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Opções de troca">
        {options.map((o, i) => {
          const marcada = o.foodId === escolhida;
          return (
            <button
              key={o.foodId}
              ref={(el) => {
                radios.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={marcada}
              tabIndex={marcada ? 0 : -1}
              onClick={() => setEscolhida(o.foodId)}
              onKeyDown={(e) => aoTeclar(e, i)}
              style={cascata(i, 55, 80)}
              className={`flex w-full animate-entra items-start gap-3 rounded-2xl border bg-white px-[15px] py-[13px] text-left transition-[border-color,box-shadow,transform] duration-250 active:scale-[0.99] ${
                marcada ? "border-tinta shadow-[inset_0_0_0_1px_var(--color-tinta)]" : "border-linha hover:-translate-y-px hover:border-pedra"
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
                  <span className="text-[15px] font-semibold tracking-[-0.01em]">{o.name}</span>
                  <span className={`shrink-0 text-[12.5px] font-semibold ${o.calorieDelta <= 0 ? "text-mata" : "text-fumo"}`}>
                    {delta(o.calorieDelta)}
                  </span>
                </span>
                <span className="mt-0.5 block text-[13px] text-fumo">{o.amount}</span>
                <span className="mt-1 block text-xs text-fumo">
                  {gramas(o.macros.carbs)} de carboidrato.{o.note ? ` ${o.note}` : ""}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {guarantee.restrictions.length > 0 ? (
        <div
          className="mt-3.5 flex animate-entra items-start gap-2.5 rounded-[14px] bg-mata-fraca px-3.5 py-3"
          style={{ animationDelay: "320ms" }}
        >
          <IconeCheck size={17} strokeWidth={1.9} className="mt-0.5 shrink-0 animate-pop text-mata [animation-delay:420ms]" />
          <span className="text-[12.5px] leading-snug text-mata-texto">
            Nenhuma dessas opções tem {juntarComE(guarantee.restrictions.map((r) => r.toLocaleLowerCase("pt-BR")))}.
          </span>
        </div>
      ) : null}

      <div className="mt-4 flex animate-entra flex-col gap-2" style={{ animationDelay: "380ms" }}>
        <Button carregando={trocando} onClick={() => aoTrocar(opcao.foodId)}>
          Usar {opcao.name.toLowerCase()}
        </Button>
        <button type="button" onClick={aoFechar} className="flex h-12 items-center justify-center text-[14.5px] font-semibold text-fumo">
          Cancelar
        </button>
      </div>
    </>
  );
}
