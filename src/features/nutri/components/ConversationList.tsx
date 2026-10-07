import type { Ref } from "react";
import type { Conversa } from "../tipos";
import { ConversationListItem } from "./ConversationListItem";

/** "Recentes": conversas anteriores, apagar cada uma e carregar as mais antigas. */
export function ConversationList({
  conversas,
  pergunta,
  apagandoId,
  aoApagar,
  temMais,
  aoCarregarMais,
  fimRef,
}: {
  conversas: Conversa[];
  /** Pergunta vinda de outra tela: vai junto ao abrir a conversa. */
  pergunta?: string;
  apagandoId: number | null;
  aoApagar: (id: number) => void;
  temMais: boolean;
  aoCarregarMais: () => void;
  /** Marcador no fim da lista (carrega mais ao aparecer). */
  fimRef?: Ref<HTMLDivElement>;
}) {
  return (
    <>
      <h2 className="mt-7 animate-entra font-display text-[15px] font-semibold" style={{ animationDelay: "220ms" }}>
        Recentes
      </h2>
      <ul className="mt-1 list-none rounded-[20px] bg-white px-4 [&>li:nth-child(2)]:[animation-delay:60ms] [&>li:nth-child(3)]:[animation-delay:120ms] [&>li:nth-child(4)]:[animation-delay:180ms] [&>li:nth-child(n+5)]:[animation-delay:240ms]">
        {conversas.map((conversa) => (
          <ConversationListItem
            key={conversa.id}
            conversa={conversa}
            pergunta={pergunta}
            apagando={apagandoId === conversa.id}
            aoApagar={() => aoApagar(conversa.id)}
          />
        ))}
      </ul>
      <div ref={fimRef} />
      {temMais ? (
        <button
          type="button"
          onClick={aoCarregarMais}
          className="mt-3 h-11 w-full rounded-full text-sm font-semibold text-mata"
        >
          Ver conversas mais antigas
        </button>
      ) : null}
    </>
  );
}
