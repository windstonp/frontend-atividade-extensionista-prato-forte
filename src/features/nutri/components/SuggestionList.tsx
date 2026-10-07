import { IconeAvancar } from "@/components/icons";
import { cascata } from "@/lib/motion";
import type { SugestaoPergunta } from "../tipos";

/** Perguntas do estado inicial do chat (as continuações dinâmicas são os SuggestionChips). */
export function SuggestionList({ sugestoes, aoEscolher }: { sugestoes: SugestaoPergunta[]; aoEscolher: (pergunta: string) => void }) {
  return (
    <>
      <h2 className="mt-5 animate-entra font-display text-[15px] font-semibold" style={{ animationDelay: "420ms" }}>
        Perguntas que cabem agora
      </h2>
      <div className="mt-2.5 flex flex-col gap-2">
        {sugestoes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => aoEscolher(s.question)}
            style={cascata(i, 80, 480)}
            className="group flex min-h-15 animate-entra items-center gap-3 rounded-2xl border border-linha bg-white py-3.5 pr-3.5 pl-4 text-left transition-[border-color,box-shadow,transform] duration-250 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-tinta hover:shadow-[0_12px_28px_-20px_rgba(21,37,28,.9)] active:scale-[0.99]"
          >
            <span className="flex-1 text-[14.5px] leading-snug font-medium">{s.question}</span>
            <IconeAvancar size={18} className="shrink-0 text-fumo transition-transform duration-250 group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </>
  );
}
