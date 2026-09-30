"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { IconeAvancar, MarcaNutri } from "@/components/icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toaster";
import { AvisoDeAlteracao } from "@/features/dia/components/AvisoDeAlteracao";
import { useDia } from "@/features/dia/hooks";
import { usePerfil } from "@/features/perfil/hooks";
import { comoApiError } from "@/lib/api/errors";
import { cascata } from "@/lib/motion";
import { useContexto, useConversa, useMensagens, usePerguntar, useResolverAcao, useSugestoes } from "../hooks";
import { juntarPaginas, perguntaDaAcao, perguntaDaUrl, ultimasSugestoes } from "../regras";
import type { AcaoNutri, MensagemNutri, Pendente } from "../tipos";
import { ChatComposer } from "./ChatComposer";
import { PerguntaBubble, RespostaBubble } from "./ChatBubble";
import { ContextCard } from "./ContextCard";
import { OfflineNotice } from "./OfflineNotice";
import { SuggestionChips } from "./SuggestionChips";
import { ThinkingIndicator } from "./ThinkingIndicator";

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const atualizar = () => setOnline(navigator.onLine);
    atualizar();
    window.addEventListener("online", atualizar);
    window.addEventListener("offline", atualizar);
    return () => {
      window.removeEventListener("online", atualizar);
      window.removeEventListener("offline", atualizar);
    };
  }, []);
  return online;
}

/** S14 — o chat (RF20, RF21). */
export function ChatTela({ id }: { id: number }) {
  const avisar = useToast();
  const online = useOnline();
  const conversa = useConversa(id);
  const mensagens = useMensagens(id);
  const perguntar = usePerguntar(id);
  const resolver = useResolverAcao(id);
  const dia = useDia();
  const perfil = usePerfil();
  const busca = useSearchParams();
  const [rascunho, setRascunho] = useState(() => perguntaDaUrl(busca.get("pergunta")));
  const [pendente, setPendente] = useState<Pendente | null>(null);
  const [aplicando, setAplicando] = useState<number | null>(null);
  const fim = useRef<HTMLDivElement>(null);
  const sequencia = useRef(0);
  const lista = juntarPaginas(mensagens.data?.pages.map((p) => p.data) ?? []);
  const proxima = dia.data?.meals.find((m) => m.isNext);
  const offline = !online || pendente?.status === "falhou";

  useEffect(() => {
    fim.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [lista.length, pendente]);

  async function enviar(texto: string) {
    const pergunta = texto.trim();
    if (!pergunta || perguntar.isPending) return;
    setRascunho("");
    const local: Pendente = { id: `p-${++sequencia.current}`, content: pergunta, status: "enviando" };
    if (!navigator.onLine) {
      setPendente({ ...local, status: "falhou" });
      return;
    }
    setPendente(local);
    try {
      await perguntar.mutateAsync(pergunta);
      setPendente(null);
    } catch (e) {
      const erro = comoApiError(e);
      if (erro.code === "TOO_MANY_REQUESTS") {
        const segundos = Number(erro.details.retryAfter) || 60;
        avisar({ texto: `Muitas perguntas seguidas. Tente de novo em ${segundos} segundos.` });
        setPendente(null);
        setRascunho(pergunta);
        return;
      }
      setPendente({ ...local, status: "falhou" });
    }
  }

  function agir(acao: AcaoNutri, mensagem: MensagemNutri) {
    const pergunta = perguntaDaAcao(acao, mensagem);
    if (pergunta) {
      void enviar(pergunta);
      return;
    }
    setAplicando(mensagem.id);
    resolver.mutate(
      { mensagem, indice: acao.index },
      {
        onError: (e) => avisar({ texto: comoApiError(e).message }),
        onSettled: () => setAplicando(null),
      },
    );
  }

  if (conversa.isError && comoApiError(conversa.error).status === 404) {
    return (
      <Screen>
        <TopBar voltarPara="/nutri" rotuloVoltar="Voltar para as conversas" />
        <main className="flex-1 px-5 pt-6">
          <h1 className="font-display text-2xl font-bold">Conversa não encontrada</h1>
          <p className="mt-2 text-sm text-fumo">Ela pode ter sido apagada.</p>
          <Link href="/nutri" className="mt-4 inline-block text-sm font-semibold text-mata">
            Ver conversas
          </Link>
        </main>
      </Screen>
    );
  }

  const vazia = mensagens.isSuccess && lista.length === 0 && !pendente;
  const sugestoes = perguntar.isPending || pendente?.status === "falhou" ? [] : ultimasSugestoes(lista);

  return (
    <Screen>
      <TopBar
        voltarPara="/nutri"
        rotuloVoltar="Voltar para as conversas"
        className={vazia ? "" : "border-b border-linha pb-3"}
        direita={
          <div className="flex flex-1 items-center gap-3 pl-1">
            <MarcaNutri size={34} apagada={offline} />
            <div className="flex-1">
              <p className="font-display text-[19px] font-bold tracking-[-0.02em]">Nutri</p>
              <p className={`text-xs ${offline ? "font-medium text-alerta" : "text-fumo"}`}>
                {offline ? "Sem conexão" : proxima ? `Olhando seu ${proxima.name.toLowerCase()} de hoje` : "Conhece seu plano e suas restrições"}
              </p>
            </div>
          </div>
        }
      />

      <AvisoDeAlteracao alteracao={dia.data?.lastChange ?? null} />

      <main className="flex-1 px-5 pt-4" aria-live="polite">
        {offline ? <OfflineNotice /> : null}

        {mensagens.isPending ? (
          <div className="flex flex-col gap-4" role="status" aria-label="Carregando a conversa">
            <Skeleton className="ml-auto h-12 w-2/3 rounded-[18px]" />
            <Skeleton className="h-24 rounded-[18px]" />
          </div>
        ) : vazia ? (
          <EstadoInicial nome={perfil.data?.preferredName} aoEscolher={(q) => void enviar(q)} />
        ) : (
          <div className="flex flex-col gap-4">
            {mensagens.hasNextPage ? (
              <button
                type="button"
                onClick={() => void mensagens.fetchNextPage()}
                className="mx-auto h-9 rounded-full px-4 text-[13px] font-semibold text-mata"
              >
                Ver mensagens anteriores
              </button>
            ) : null}
            {lista.map((m) =>
              m.role === "user" ? (
                <PerguntaBubble key={m.id} texto={m.content} />
              ) : (
                <RespostaBubble key={m.id} mensagem={m} aplicando={aplicando === m.id} aoAgir={(a) => agir(a, m)} />
              ),
            )}
            {pendente ? (
              <PerguntaBubble
                texto={pendente.content}
                status={pendente.status}
                aoReenviar={() => {
                  setPendente(null);
                  void enviar(pendente.content);
                }}
              />
            ) : null}
            {perguntar.isPending ? <ThinkingIndicator /> : null}
          </div>
        )}
        <div ref={fim} />
      </main>

      <SuggestionChips sugestoes={sugestoes} aoEscolher={(s) => void enviar(s)} />
      <ChatComposer valor={rascunho} aoMudar={setRascunho} aoEnviar={() => void enviar(rascunho)} enviando={perguntar.isPending} />
    </Screen>
  );
}

function EstadoInicial({ nome, aoEscolher }: { nome?: string; aoEscolher: (q: string) => void }) {
  const contexto = useContexto();
  const sugestoes = useSugestoes();
  return (
    <>
      <h1 className="animate-entra font-display text-[27px] leading-tight font-bold tracking-[-0.028em]">
        No que posso ajudar{nome ? `, ${nome}` : ""}?
      </h1>
      <p className="mt-2 animate-entra text-sm leading-normal text-fumo" style={{ animationDelay: "90ms" }}>
        Pergunte como se estivesse falando com a nutricionista da academia.
      </p>
      <ContextCard linhas={contexto.data} />
      <h2 className="mt-5 animate-entra font-display text-[15px] font-semibold" style={{ animationDelay: "420ms" }}>
        Perguntas que cabem agora
      </h2>
      <div className="mt-2.5 flex flex-col gap-2">
        {(sugestoes.data ?? []).map((s, i) => (
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
