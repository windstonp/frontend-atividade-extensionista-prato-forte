import Link from "next/link";
import { IconeCheck } from "@/components/icons";
import { kcal } from "@/lib/format";
import { cascata } from "@/lib/motion";
import type { RefeicaoDoDia } from "../tipos";

/** Uma refeição na lista da Dieta. Só hoje abre o detalhe (RN23). */
export function MealRow({ refeicao, indice, clicavel }: { refeicao: RefeicaoDoDia; indice: number; clicavel: boolean }) {
  const proxima = refeicao.isNext;

  const corpo = (
    <>
      <div className="flex items-baseline gap-2.5">
        <span className="w-11 text-[12.5px] font-semibold text-fumo">{refeicao.time}</span>
        <span className="flex-1 text-base font-semibold tracking-[-0.01em]">{refeicao.name}</span>
        <span className={`text-[12.5px] ${proxima ? "font-semibold" : "text-fumo"}`}>{kcal(refeicao.calories)}</span>
      </div>
      <p className="mt-1 pl-[54px] text-[13px] leading-snug text-fumo first-letter:uppercase">{refeicao.summary}</p>
      {proxima ? (
        <span className="mt-2.5 ml-[54px] inline-flex h-[26px] items-center gap-1.5 rounded-full bg-gema-fraca px-2.5">
          <span className="size-1.5 rounded-full bg-gema" />
          <span className="text-[11.5px] font-semibold text-gema-texto">Próxima refeição</span>
        </span>
      ) : refeicao.note ? (
        <span className="mt-2.5 ml-[54px] inline-flex h-[26px] items-center rounded-full bg-mata-fraca px-2.5 text-[11.5px] font-semibold text-mata-texto">
          {refeicao.note}
        </span>
      ) : null}
    </>
  );

  return (
    <li className="relative mb-2.5 animate-entra-lado-esq last:mb-0" style={cascata(indice, 75, 180)}>
      {refeicao.done ? (
        <span
          aria-label="Feita"
          role="img"
          className="absolute top-[22px] -left-6 flex size-3 animate-pop items-center justify-center rounded-full bg-mata text-white"
        >
          <IconeCheck size={8} strokeWidth={2.4} />
        </span>
      ) : proxima ? (
        <span className="absolute top-5 -left-[26px] block size-4">
          <span className="absolute inset-0 animate-halo rounded-full bg-gema" />
          <span className="absolute inset-0 rounded-full bg-gema shadow-[0_0_0_3px_var(--color-papel)]" />
        </span>
      ) : (
        <span className="absolute top-[23px] -left-[23px] size-2.5 rounded-full border-[1.5px] border-pedra bg-papel" />
      )}

      {clicavel ? (
        <Link
          href={`/dieta/${refeicao.slot}`}
          className={`block rounded-[18px] border bg-white px-4 py-3.5 transition-[border-color,box-shadow,transform] duration-250 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-pedra hover:shadow-[0_14px_30px_-22px_rgba(21,37,28,.9)] active:scale-[0.99] ${
            proxima ? "border-tinta shadow-[inset_0_0_0_1px_var(--color-tinta)]" : "border-transparent"
          } ${refeicao.done ? "bg-white/70" : ""}`}
        >
          {corpo}
        </Link>
      ) : (
        <div className="block rounded-[18px] border border-transparent bg-white px-4 py-3.5">{corpo}</div>
      )}
    </li>
  );
}
