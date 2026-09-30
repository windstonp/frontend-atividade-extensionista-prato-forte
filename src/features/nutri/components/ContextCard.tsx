import { Skeleton } from "@/components/ui/Skeleton";
import { cascata } from "@/lib/motion";
import type { LinhaContexto } from "../tipos";

const COR = { gema: "bg-gema", alerta: "bg-alerta", mata: "bg-mata" };

/** "O que estou olhando agora" — a versão legível do contexto do Nutri (RN29). */
export function ContextCard({ linhas }: { linhas?: LinhaContexto[] }) {
  return (
    <section className="mt-[18px] animate-escala rounded-[18px] bg-white px-4 pt-1 pb-2" style={{ animationDelay: "160ms" }}>
      <p className="py-3 text-[12.5px] font-semibold text-fumo">O que estou olhando agora</p>
      {!linhas ? (
        <div className="flex flex-col gap-2 pb-2" role="status" aria-label="Carregando o que o Nutri está olhando">
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      ) : (
        linhas.map((linha, i) => (
          <div
            key={linha.text}
            style={cascata(i, 70, 260)}
            className={`flex animate-entra-lado-esq items-start gap-2.5 py-[9px] ${i < linhas.length - 1 ? "border-b border-fio" : ""}`}
          >
            <span className={`mt-1.5 size-1.5 shrink-0 animate-pop rounded-full ${COR[linha.tone]}`} style={cascata(i, 70, 300)} />
            <span className="text-[13.5px] leading-snug first-letter:uppercase">{linha.text}</span>
          </div>
        ))
      )}
    </section>
  );
}
