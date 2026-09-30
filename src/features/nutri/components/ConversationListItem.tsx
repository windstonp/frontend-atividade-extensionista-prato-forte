import Link from "next/link";
import { quando } from "../regras";
import type { Conversa } from "../tipos";

/** Uma conversa anterior: título, quando, quantas mensagens e a prévia da última. */
export function ConversationListItem({
  conversa,
  pergunta,
  apagando = false,
  aoApagar,
  agora,
}: {
  conversa: Conversa;
  pergunta?: string;
  apagando?: boolean;
  aoApagar: () => void;
  agora?: Date;
}) {
  const href = `/nutri/${conversa.id}${pergunta ? `?pergunta=${encodeURIComponent(pergunta)}` : ""}`;
  return (
    <li className={`flex animate-entra items-start gap-3 border-b border-fio py-3.5 transition-opacity last:border-b-0 ${apagando ? "opacity-40" : ""}`}>
      <Link href={href} className="min-w-0 flex-1 rounded-lg">
        <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">{conversa.title ?? "Conversa sem título"}</p>
        <p className="mt-0.5 text-xs text-fumo">
          {conversa.lastMessageAt ? `${quando(conversa.lastMessageAt, agora)}, ` : ""}
          {conversa.messageCount} {conversa.messageCount === 1 ? "mensagem" : "mensagens"}
        </p>
        {conversa.preview ? <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-fumo">{conversa.preview}</p> : null}
      </Link>
      <button
        type="button"
        onClick={aoApagar}
        disabled={apagando}
        className="flex h-9 shrink-0 items-center rounded-full px-3 text-[13px] font-semibold text-fumo transition-colors hover:bg-alerta-fraca hover:text-alerta-texto disabled:opacity-50"
      >
        Apagar
      </button>
    </li>
  );
}
