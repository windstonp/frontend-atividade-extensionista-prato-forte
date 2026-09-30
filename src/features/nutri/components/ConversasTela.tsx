"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { IconeMais, MarcaNutri } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toaster";
import { comoApiError } from "@/lib/api/errors";
import { useApagarConversa, useConversas, useNovaConversa } from "../hooks";
import { perguntaDaUrl } from "../regras";
import { ConversationListItem } from "./ConversationListItem";

/** N05 — continuar uma conversa ou começar outra (RF19, RN28). */
export function ConversasTela() {
  const router = useRouter();
  const avisar = useToast();
  const pergunta = perguntaDaUrl(useSearchParams().get("pergunta"));
  const conversas = useConversas();
  const nova = useNovaConversa();
  const apagar = useApagarConversa();
  const [alvo, setAlvo] = useState<number | null>(null);
  const fim = useRef<HTMLDivElement>(null);
  const lista = conversas.data?.pages.flatMap((p) => p.data) ?? [];
  const destino = (id: number) => `/nutri/${id}${pergunta ? `?pergunta=${encodeURIComponent(pergunta)}` : ""}`;

  async function comecar(trocar: boolean) {
    try {
      const conversa = await nova.mutateAsync();
      if (trocar) router.replace(destino(conversa.id));
      else router.push(destino(conversa.id));
    } catch (e) {
      avisar({ texto: comoApiError(e).message });
    }
  }

  // Sem conversas anteriores: pula a lista (RF19). Só com a resposta do servidor em mãos:
  // a lista vazia guardada da primeira visita não conta.
  const semNenhuma = conversas.isSuccess && !conversas.isFetching && lista.length === 0;
  useEffect(() => {
    if (semNenhuma && nova.isIdle) void comecar(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semNenhuma]);

  // Carrega mais ao chegar ao fim da lista.
  useEffect(() => {
    const el = fim.current;
    if (!el || !conversas.hasNextPage || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !conversas.isFetchingNextPage) void conversas.fetchNextPage();
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, [conversas]);

  return (
    <Screen>
      <TopBar voltarPara="/hoje" rotuloVoltar="Voltar para hoje" direita={<MarcaNutri size={30} />} />

      <main className="flex-1 px-5 pt-2 pb-8">
        <h1 className="animate-entra font-display text-[28px] leading-tight font-bold tracking-[-0.028em]">Conversas com o Nutri</h1>
        <p className="mt-2 animate-entra text-sm leading-normal text-fumo" style={{ animationDelay: "80ms" }}>
          Continue de onde parou ou comece um assunto novo. O Nutri lembra do que vocês já conversaram.
        </p>

        {pergunta ? (
          <p className="mt-4 animate-entra rounded-2xl bg-gema-fraca px-4 py-3 text-[13.5px] leading-snug text-gema-texto" style={{ animationDelay: "140ms" }}>
            Sua pergunta: “{pergunta}”. Escolha onde perguntar.
          </p>
        ) : null}

        <Button className="mt-5 animate-entra" carregando={nova.isPending} onClick={() => void comecar(false)} style={{ animationDelay: "180ms" }}>
          <IconeMais size={18} />
          Nova conversa
        </Button>

        {conversas.isError ? (
          <div className="mt-6">
            <ErrorState
              titulo="Não foi possível carregar suas conversas"
              descricao="Suas conversas estão salvas. Só a conexão falhou agora."
              aoTentarDeNovo={() => void conversas.refetch()}
            />
          </div>
        ) : !conversas.data || lista.length === 0 ? (
          <div className="mt-6 flex flex-col gap-3" role="status" aria-label="Carregando conversas">
            <Skeleton className="h-[74px] rounded-2xl" />
            <Skeleton className="h-[74px] rounded-2xl" />
            <Skeleton className="h-[74px] rounded-2xl" />
          </div>
        ) : (
          <>
            <h2 className="mt-7 animate-entra font-display text-[15px] font-semibold" style={{ animationDelay: "220ms" }}>
              Recentes
            </h2>
            <ul className="mt-1 list-none rounded-[20px] bg-white px-4 [&>li:nth-child(2)]:[animation-delay:60ms] [&>li:nth-child(3)]:[animation-delay:120ms] [&>li:nth-child(4)]:[animation-delay:180ms] [&>li:nth-child(n+5)]:[animation-delay:240ms]">
              {lista.map((conversa) => (
                <ConversationListItem
                  key={conversa.id}
                  conversa={conversa}
                  pergunta={pergunta || undefined}
                  apagando={apagar.isPending && apagar.variables === conversa.id}
                  aoApagar={() => setAlvo(conversa.id)}
                />
              ))}
            </ul>
            <div ref={fim} />
            {conversas.hasNextPage ? (
              <button
                type="button"
                onClick={() => void conversas.fetchNextPage()}
                className="mt-3 h-11 w-full rounded-full text-sm font-semibold text-mata"
              >
                Ver conversas mais antigas
              </button>
            ) : null}
          </>
        )}
      </main>

      <Sheet
        aberta={alvo !== null}
        aoFechar={() => setAlvo(null)}
        titulo="Apagar esta conversa?"
        descricao="O Nutri também esquece o que foi dito nela."
        tom="destrutivo"
      >
        <div className="mt-5 flex flex-col gap-2">
          <Button
            variante="destrutiva"
            onClick={() => {
              if (alvo === null) return;
              apagar.mutate(alvo, { onError: (e) => avisar({ texto: comoApiError(e).message }) });
              setAlvo(null);
            }}
          >
            Apagar
          </Button>
          <button type="button" onClick={() => setAlvo(null)} className="flex h-12 items-center justify-center text-[14.5px] font-semibold text-fumo">
            Cancelar
          </button>
        </div>
      </Sheet>
    </Screen>
  );
}
