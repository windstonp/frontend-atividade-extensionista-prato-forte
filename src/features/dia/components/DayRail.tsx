"use client";

import Link from "next/link";
import { IconeCheck } from "@/components/icons";
import { kcal } from "@/lib/format";
import { cascata, useMontado } from "@/lib/motion";
import type { RefeicaoDoDia, Slot } from "../tipos";

const ALTURA_LINHA = 46;

/**
 * A linha do dia: o dia inteiro como um traço vertical, com a próxima refeição aberta na posição dela.
 * Responde "o que eu preciso fazer hoje?" com comida, e não com número.
 */
export function DayRail({
  refeicoes,
  aoAlternar,
  ocupado = false,
}: {
  refeicoes: RefeicaoDoDia[];
  aoAlternar: (slot: Slot, done: boolean) => void;
  /** Uma marcação ainda está a caminho do servidor: o botão espera. */
  ocupado?: boolean;
}) {
  const montado = useMontado(120);
  const proxima = refeicoes.find((m) => m.isNext);
  const feitas = refeicoes.filter((m) => m.done).length;
  const indiceProxima = proxima ? refeicoes.indexOf(proxima) : refeicoes.length;

  return (
    <section className="animate-escala rounded-3xl bg-tinta px-[18px] pt-4 pb-[18px] text-neve">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="animate-entra font-display text-[15px] font-semibold">Seu dia</h2>
        <p className="animate-entra text-[12.5px] text-musgo" style={{ animationDelay: "80ms" }}>
          {feitas} de {refeicoes.length} refeições
        </p>
      </div>

      <div className="relative pl-[26px]">
        <span className="absolute top-2.5 bottom-2.5 left-1.5 block w-0.5 rounded-full bg-breu" />
        {/* o trecho verde cresce até a refeição da vez */}
        <span
          className="absolute top-2.5 left-1.5 block w-0.5 rounded-full bg-mata transition-[height] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ height: montado ? `${indiceProxima * ALTURA_LINHA}px` : "0px" }}
        />

        {/* os traços ficam fora da lista: <ol> só pode ter <li> */}
        <ol className="list-none">
          {refeicoes.map((refeicao, i) =>
            refeicao.slot === proxima?.slot ? (
              <ProximaRefeicao key={refeicao.slot} refeicao={refeicao} indice={i} aoAlternar={aoAlternar} ocupado={ocupado} />
            ) : (
              <LinhaCompacta key={refeicao.slot} refeicao={refeicao} indice={i} />
            ),
          )}
        </ol>
      </div>
    </section>
  );
}

function LinhaCompacta({ refeicao, indice }: { refeicao: RefeicaoDoDia; indice: number }) {
  const feita = refeicao.done;
  return (
    <li className="relative flex h-[46px] animate-entra-lado-esq items-center gap-2.5" style={cascata(indice, 70, 140)}>
      {feita ? (
        <span className="absolute left-0 flex size-3.5 animate-pop items-center justify-center rounded-full bg-mata text-tinta">
          <IconeCheck size={9} strokeWidth={2.4} />
        </span>
      ) : (
        <span className="absolute left-0.5 size-2.5 rounded-full border-[1.5px] border-[#4a5d52] transition-colors duration-300" />
      )}
      <span className={`w-11 text-[12.5px] ${feita ? "text-cinza-treino" : "text-musgo"}`}>{refeicao.time}</span>
      <Link
        href={`/dieta/${refeicao.slot}`}
        className={`flex-1 text-[14.5px] transition-colors duration-200 hover:text-gema ${
          feita ? "text-musgo line-through decoration-musgo/40" : "text-neve"
        }`}
      >
        {refeicao.name}
      </Link>
      <span className={`text-[12.5px] ${feita ? "text-cinza-treino" : "text-musgo"}`}>{kcal(refeicao.calories)}</span>
    </li>
  );
}

function ProximaRefeicao({
  refeicao,
  indice,
  aoAlternar,
  ocupado,
}: {
  refeicao: RefeicaoDoDia;
  indice: number;
  aoAlternar: (slot: Slot, done: boolean) => void;
  ocupado: boolean;
}) {
  return (
    <li className="relative my-2 animate-escala" style={cascata(indice, 70, 180)}>
      {/* o marcador da vez pulsa devagar: é o único ponto em movimento da tela */}
      <span className="absolute top-5 -left-7 block size-[18px]">
        <span className="absolute inset-0 animate-halo rounded-full bg-gema" />
        <span className="absolute inset-0 rounded-full bg-gema shadow-[0_0_0_4px_var(--color-tinta)]" />
      </span>

      <div className="rounded-2xl bg-white p-3.5 text-tinta shadow-[0_18px_40px_-26px_rgba(0,0,0,.8)]">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[21px] font-bold tracking-[-0.02em]">{refeicao.name}</h3>
          <span className="shrink-0 text-[12.5px] font-semibold text-fumo">{refeicao.time}</span>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-snug text-fumo first-letter:uppercase">{refeicao.summary}</p>
        <div className="mt-3 flex gap-4 border-t border-fio pt-2.5">
          <span className="text-[13px] font-semibold">
            {Math.round(refeicao.calories)} <span className="font-medium text-fumo">kcal</span>
          </span>
          <span className="text-[13px] font-semibold">
            {Math.round(refeicao.macros.protein)} g <span className="font-medium text-fumo">proteína</span>
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            href={`/dieta/${refeicao.slot}`}
            className="group relative flex h-11 flex-1 items-center justify-center overflow-hidden rounded-full bg-gema text-sm font-semibold text-tinta transition-[filter,box-shadow] duration-250 hover:brightness-[.97] hover:shadow-[0_8px_20px_-10px_rgba(21,37,28,.6)] active:scale-[0.97]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-100 from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden" />
            <span className="relative">Ver refeição</span>
          </Link>
          <button
            type="button"
            onClick={() => aoAlternar(refeicao.slot, true)}
            disabled={ocupado}
            aria-pressed={false}
            aria-label={`Marcar ${refeicao.name.toLowerCase()} como feita`}
            className="group flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-tinta transition-[background-color,color] duration-250 hover:bg-tinta hover:text-neve active:scale-90 disabled:opacity-60"
          >
            <IconeCheck
              size={19}
              strokeWidth={2}
              className="transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110"
            />
          </button>
        </div>
      </div>
    </li>
  );
}
