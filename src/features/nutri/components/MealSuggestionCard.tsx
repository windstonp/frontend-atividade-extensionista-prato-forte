import { gramas, kcal } from "@/lib/format";
import { cascata } from "@/lib/motion";
import type { CartaoRefeicao } from "../tipos";

/** Refeição inteira proposta pelo Nutri (RN31). */
export function MealSuggestionCard({ cartao }: { cartao: CartaoRefeicao }) {
  return (
    <>
      <div className="mt-3 animate-escala rounded-[18px] bg-white px-4 py-3.5" style={{ animationDelay: "160ms" }}>
        <div className="flex items-baseline justify-between">
          <p className="font-display text-[17px] font-bold tracking-[-0.02em]">
            {cartao.title}, {cartao.time}
          </p>
          <span className="text-[13px] font-semibold">{kcal(cartao.calories)}</span>
        </div>
        <ul className="mt-2 list-none">
          {cartao.items.map((item, i) => (
            <li
              key={`${item.foodId}-${i}`}
              style={cascata(i, 90, 320)}
              className={`flex animate-entra-lado-esq items-baseline gap-2.5 py-2.5 ${i < cartao.items.length - 1 ? "border-b border-fio" : ""}`}
            >
              <span className="flex-1 text-sm font-medium">{item.name}</span>
              <span className="text-[12.5px] text-fumo">{item.amount}</span>
              <span className="w-[58px] text-right text-[12.5px] font-semibold">{kcal(item.calories)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-3.5 border-t border-fio pt-3">
          <span className="text-[12.5px] text-fumo">
            {gramas(cartao.macros.protein)} <b className="font-semibold text-tinta">proteína</b>
          </span>
          <span className="text-[12.5px] text-fumo">
            {gramas(cartao.macros.carbs)} <b className="font-semibold text-tinta">carbo</b>
          </span>
          <span className="text-[12.5px] text-fumo">
            {gramas(cartao.macros.fat)} <b className="font-semibold text-tinta">gordura</b>
          </span>
        </div>
      </div>
      {cartao.warning ? (
        <div className="mt-3 flex animate-entra items-start gap-2.5 rounded-[14px] bg-gema-fraca px-3.5 py-3" style={{ animationDelay: "560ms" }}>
          <span className="mt-1.5 size-1.5 shrink-0 animate-respira rounded-full bg-gema" />
          <span className="text-[12.5px] leading-snug text-gema-texto">{cartao.warning}</span>
        </div>
      ) : null}
    </>
  );
}
