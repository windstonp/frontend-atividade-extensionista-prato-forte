import { IconeRecomecar, MarcaNutri } from "@/components/icons";
import type { AcaoNutri, MensagemNutri } from "../tipos";
import { MealSuggestionCard } from "./MealSuggestionCard";
import { NutriActions } from "./NutriActions";
import { SwapCard } from "./SwapCard";

/** A pergunta da pessoa; se não saiu, oferece reenviar. */
export function PerguntaBubble({
  texto,
  status,
  aoReenviar,
}: {
  texto: string;
  status?: "enviando" | "falhou";
  aoReenviar?: () => void;
}) {
  const falhou = status === "falhou";
  return (
    <div className="flex animate-entra-lado flex-col items-end">
      <p
        className={`max-w-[264px] rounded-[18px] rounded-br-md px-[15px] py-3 text-[14.5px] leading-snug break-words whitespace-pre-wrap ${
          falhou ? "border border-linha bg-white text-fumo" : "bg-tinta text-neve"
        } ${status === "enviando" ? "opacity-80" : ""}`}
      >
        {texto}
      </p>
      {falhou ? (
        <div className="mt-2 flex animate-balanca items-center gap-2.5">
          <span className="text-xs font-medium text-alerta">Não enviada</span>
          <button
            type="button"
            onClick={aoReenviar}
            className="flex h-9 items-center gap-[7px] rounded-full border-[1.5px] border-tinta px-3.5 text-[13px] font-semibold"
          >
            <IconeRecomecar size={15} strokeWidth={2} />
            Tentar de novo
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** A resposta do Nutri: texto, cartão, segundo parágrafo e ações. */
export function RespostaBubble({
  mensagem,
  aplicando = false,
  aoAgir,
}: {
  mensagem: MensagemNutri;
  aplicando?: boolean;
  aoAgir: (acao: AcaoNutri) => void;
}) {
  return (
    <div className="flex animate-entra-lado-esq gap-2.5">
      <span className="animate-pop">
        <MarcaNutri size={26} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="animate-entra text-[14.5px] leading-relaxed break-words whitespace-pre-wrap">{mensagem.content}</p>
        {mensagem.card?.type === "swap" ? <SwapCard cartao={mensagem.card} /> : null}
        {mensagem.card?.type === "meal" ? <MealSuggestionCard cartao={mensagem.card} /> : null}
        {mensagem.followUp ? (
          <p className="mt-3 animate-entra text-[14.5px] leading-relaxed" style={{ animationDelay: "420ms" }}>
            {mensagem.followUp}
          </p>
        ) : null}
        <NutriActions acoes={mensagem.actionsAvailable ? mensagem.actions : []} aplicando={aplicando} aoAgir={aoAgir} />
      </div>
    </div>
  );
}
