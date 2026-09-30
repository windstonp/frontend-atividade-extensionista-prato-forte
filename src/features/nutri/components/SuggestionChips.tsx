import { cascata } from "@/lib/motion";

/** RN45 — continuações da última resposta; tocar envia a pergunta. */
export function SuggestionChips({ sugestoes, aoEscolher }: { sugestoes: string[]; aoEscolher: (texto: string) => void }) {
  if (sugestoes.length === 0) return null;
  return (
    <div className="flex shrink-0 flex-wrap gap-2 px-4 pb-1" aria-label="Sugestões de pergunta" role="group">
      {sugestoes.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => aoEscolher(s)}
          style={cascata(i, 70, 120)}
          className="min-h-9 animate-escala rounded-full border border-linha bg-white px-3.5 py-1.5 text-left text-[13px] font-medium transition-[border-color,transform] duration-250 hover:-translate-y-px hover:border-pedra active:scale-95"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
