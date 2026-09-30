import { gramas, kcal } from "@/lib/format";
import { cascata } from "@/lib/motion";
import type { ItemDoDia } from "../tipos";

/** Um alimento do prato: porção em medida caseira, kcal e macros, selo "Trocado". */
export function FoodItemRow({
  item,
  indice,
  ultimo,
  aoTrocar,
}: {
  item: ItemDoDia;
  indice: number;
  ultimo: boolean;
  aoTrocar?: () => void;
}) {
  return (
    <li
      style={cascata(indice, 65, 360)}
      className={`flex animate-entra-lado-esq items-start gap-3 py-[15px] ${ultimo ? "" : "border-b border-fio"}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold tracking-[-0.01em]">{item.name}</span>
          {item.replacedFrom ? (
            <span className="inline-flex h-[22px] animate-pop items-center rounded-full bg-mata-fraca px-2.5 text-[11px] font-semibold text-mata-texto">
              Trocado
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[13px] text-fumo">{item.amount}</p>
        <p className="mt-1 text-xs text-fumo">
          <b className="font-semibold text-[#3d4a42]">{kcal(item.calories)}</b>
          {item.macros.protein >= 1 ? `   ${gramas(item.macros.protein)} proteína` : ""}
          {item.macros.carbs >= 1 ? `   ${gramas(item.macros.carbs)} carbo` : ""}
          {item.macros.fat >= 5 ? `   ${gramas(item.macros.fat)} gordura` : ""}
        </p>
        {item.replacedFrom ? <p className="mt-1 text-xs text-fumo">No lugar de {item.replacedFrom.toLowerCase()}</p> : null}
      </div>
      {aoTrocar ? (
        <button
          type="button"
          onClick={aoTrocar}
          className="flex h-11 shrink-0 items-center rounded-full border-[1.5px] border-linha px-4 text-[13px] font-semibold transition-[border-color,background-color,transform] duration-250 hover:-translate-y-px hover:border-tinta hover:bg-white active:scale-95"
        >
          Trocar
          <span className="sr-only"> {item.name}</span>
        </button>
      ) : null}
    </li>
  );
}
