import { IconeSeta } from "@/components/icons";
import { gramas, kcal } from "@/lib/format";
import type { CartaoTroca } from "../tipos";

const delta = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n))} kcal no dia`;

/** Troca proposta: de → para, com números do catálogo (RN31). */
export function SwapCard({ cartao }: { cartao: CartaoTroca }) {
  return (
    <div
      role="group"
      aria-label={`De ${cartao.from.name.toLowerCase()} para ${cartao.to.name.toLowerCase()}`}
      className="mt-3 animate-escala rounded-[18px] bg-white px-4 py-3.5"
      style={{ animationDelay: "160ms" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold">{cartao.from.name}</p>
          <p className="mt-0.5 text-xs text-fumo">
            {cartao.from.amount}, {kcal(cartao.from.calories)}
          </p>
        </div>
        <IconeSeta size={20} className="shrink-0 animate-entra-lado text-fumo" style={{ animationDelay: "320ms" }} />
        <div className="flex-1 text-right">
          <p className="text-[13.5px] font-semibold">{cartao.to.name}</p>
          <p className="mt-0.5 text-xs text-fumo">
            {cartao.to.amount}, {kcal(cartao.to.calories)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3.5 border-t border-fio pt-3">
        <span className="text-[12.5px] text-fumo">
          Carboidrato{" "}
          <b className="font-semibold text-tinta">
            {gramas(cartao.carbsBefore)} para {gramas(cartao.carbsAfter)}
          </b>
        </span>
        <span className={`text-[12.5px] font-semibold ${cartao.calorieDelta <= 0 ? "text-mata" : "text-fumo"}`}>
          {delta(cartao.calorieDelta)}
        </span>
      </div>
    </div>
  );
}
