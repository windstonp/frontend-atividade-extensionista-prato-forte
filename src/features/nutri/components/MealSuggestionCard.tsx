import { gramas, kcal } from "@/lib/format";
import { cascata } from "@/lib/motion";
import type { CartaoRefeicao } from "../tipos";
import { Aviso } from "@/components/ui/Aviso";

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
        <Aviso tom="gema" className="mt-3 [animation-delay:560ms]">
          {cartao.warning}
        </Aviso>
      ) : null}
    </>
  );
}
