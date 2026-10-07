import { IconeMais } from "@/components/icons";
import { Selo } from "@/components/ui/Selo";
import { kcal } from "@/lib/format";
import type { Registro } from "../tipos";

/** "O que você comeu" — cartão branco; cada linha abre a edição (RF34). Sem ações = somente leitura. */
export function EntryList({ registros, aoAbrir, aoAdicionar }: { registros: Registro[]; aoAbrir?: (r: Registro) => void; aoAdicionar?: () => void }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-[15px] font-semibold">O que você comeu</h2>
      {registros.length === 0 ? (
        <p className="mt-2.5 rounded-[20px] bg-white px-[18px] py-4 text-[13.5px] leading-snug text-fumo">
          Nada registrado ainda. Toque em + numa sugestão ou adicione o que você comeu.
        </p>
      ) : (
        <ul className="mt-2.5 list-none rounded-[20px] bg-white px-[18px]">
          {registros.map((r) => {
            const corpo = (
              <>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-semibold">{r.name}</span>
                  <span className="shrink-0 text-[13px] font-semibold tabular-nums">{kcal(r.calories)}</span>
                </span>
                <span className="mt-0.5 block text-[12.5px] text-fumo">{r.amountText}</span>
                {r.conflicts.length > 0 ? <Selo tom="alerta" className="mt-1.5">{r.conflicts.join(", ")}</Selo> : null}
              </>
            );
            return (
              <li key={r.id} className="animate-entra border-b border-fio last:border-b-0">
                {aoAbrir ? (
                  <button type="button" onClick={() => aoAbrir(r)} aria-label={`${r.name}, ${r.amountText}, ${kcal(r.calories)}. Editar`}
                    className="block w-full py-3 text-left">{corpo}</button>
                ) : (
                  <div className="py-3">{corpo}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {aoAdicionar ? (
        <button type="button" onClick={aoAdicionar}
          className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-tinta text-sm font-semibold hover:bg-tinta/5">
          <IconeMais size={18} /> Adicionar alimento
        </button>
      ) : null}
    </section>
  );
}
