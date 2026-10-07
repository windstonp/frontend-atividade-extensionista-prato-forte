import { IconeCheck, IconeMais } from "@/components/icons";
import { Selo } from "@/components/ui/Selo";
import type { ItemDoDia } from "../tipos";

/**
 * "Sugestão para bater a meta" (o antigo "O que vai no prato") — tipograficamente secundária:
 * texto fumo sobre papel, sem cartão. "+" registra o item; ✓ = já registrado (RF32).
 */
export function SuggestionList({ itens, aoRegistrar, aoRegistrarTodos, aoTrocar, ocupado = false }: {
  itens: ItemDoDia[];
  aoRegistrar?: (i: ItemDoDia) => void;
  aoRegistrarTodos?: (itens: ItemDoDia[]) => void;
  aoTrocar?: (i: ItemDoDia) => void;
  ocupado?: boolean;
}) {
  const faltam = itens.filter((i) => !i.registered && i.id !== null);
  if (itens.length === 0) return null;

  return (
    <section className="mt-7">
      <h2 className="font-display text-[15px] font-semibold">Sugestão para bater a meta</h2>
      <p className="mt-0.5 text-[12.5px] text-fumo">Montamos com o que você tem em casa.</p>
      <ul className="mt-2 list-none">
        {itens.map((item) => (
          <li key={item.id ?? item.foodId} className="flex items-center gap-2 py-2">
            <span className="min-w-0 flex-1">
              <span className={`block text-[14px] font-medium ${item.registered ? "text-fumo" : "text-tinta"}`}>{item.name}</span>
              <span className="block text-[12.5px] text-fumo">{item.amount} · {item.calories} kcal</span>
              {item.replacedFrom ? <Selo tom="gema" className="mt-1">No lugar de {item.replacedFrom.toLowerCase()}</Selo> : null}
            </span>
            {aoTrocar && !item.registered && item.id !== null ? (
              <button type="button" onClick={() => aoTrocar(item)} aria-label={`Trocar ${item.name}`}
                className="h-11 shrink-0 px-2 text-[13px] font-semibold text-mata hover:text-tinta">Trocar</button>
            ) : null}
            {item.registered ? (
              <button type="button" disabled aria-label={`${item.name} já registrado`} className="flex size-11 shrink-0 items-center justify-center">
                <span className="flex size-[30px] animate-pop items-center justify-center rounded-full bg-mata text-white"><IconeCheck size={15} strokeWidth={2.4} /></span>
              </button>
            ) : aoRegistrar && item.id !== null ? (
              <button type="button" disabled={ocupado} onClick={() => aoRegistrar(item)} aria-label={`Registrar ${item.name}, ${item.amount}`}
                className="group flex size-11 shrink-0 items-center justify-center disabled:opacity-50">
                <span className="flex size-[30px] items-center justify-center rounded-full border-[1.5px] border-tinta transition-[background-color,color,transform] duration-200 group-hover:bg-tinta group-hover:text-neve group-active:scale-90">
                  <IconeMais size={16} />
                </span>
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {aoRegistrarTodos && faltam.length >= 2 ? (
        <button type="button" disabled={ocupado} onClick={() => aoRegistrarTodos(faltam)}
          className="mt-1 h-10 rounded-full border border-linha bg-white px-4 text-[13px] font-semibold hover:border-pedra disabled:opacity-50">
          Adicionar os {faltam.length}
        </button>
      ) : null}
    </section>
  );
}
