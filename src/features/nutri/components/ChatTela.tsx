"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { MarcaNutri } from "@/components/icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toaster";
import { AvisoDeAlteracao } from "@/features/dia/components/AvisoDeAlteracao";
import { useDia } from "@/features/dia/hooks";
import { usePerfil } from "@/features/perfil/hooks";
import { comoApiError } from "@/lib/api/errors";
import { Avaliacao } from "@/features/validacao/components/Avaliacao";
import { useContexto, useConversa, useMensagens, usePerguntar, useResolverAcao, useSugestoes } from "../hooks";
import { juntarPaginas, perguntaDaAcao, perguntaDaUrl, ultimasSugestoes } from "../regras";
import type { AcaoNutri, MensagemNutri, Pendente } from "../tipos";
import { ChatComposer } from "./ChatComposer";
import { PerguntaBubble, RespostaBubble } from "./ChatBubble";
import { ContextCard } from "./ContextCard";
import { OfflineNotice } from "./OfflineNotice";
import { SuggestionChips } from "./SuggestionChips";
import { SuggestionList } from "./SuggestionList";
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
  const [perdida, setPerdida] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const fim = useRef<HTMLDivElement>(null);
  const alturaAntes = useRef<number | null>(null);
  const sequencia = useRef(0);
  const lista = juntarPaginas(mensagens.data?.pages.map((p) => p.data) ?? []);
  const primeiroId = lista[0]?.id;
  const ultimoId = lista.at(-1)?.id;
  const proxima = dia.data?.meals.find((m) => m.isNext);
  const offline = !online || pendente?.status === "falhou";

  // Desce só quando chega mensagem nova no fim (ou uma pendente); mensagens antigas entram em cima.
  useEffect(() => {
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    fim.current?.scrollIntoView?.({ behavior: reduzir ? "auto" : "smooth", block: "end" });
  }, [ultimoId, pendente]);

  // Depois de carregar mensagens anteriores, mantém na tela o que a pessoa estava lendo.
  useLayoutEffect(() => {
    if (alturaAntes.current === null) return;
    const diferenca = document.documentElement.scrollHeight - alturaAntes.current;
    alturaAntes.current = null;
    if (diferenca > 0) window.scrollBy(0, diferenca);
  }, [primeiroId]);

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
      const { assistantMessage } = await perguntar.mutateAsync(pergunta);
      setPendente(null);
      setAnuncio(`O Nutri respondeu: ${assistantMessage.content}`);
    } catch (e) {
      const erro = comoApiError(e);
      if (erro.status === 404) {
        setPerdida(true); // apagada em outra aba
        return;
      }
      // Sem internet (0) ou IA fora (503): a pergunta fica "Não enviada", com "Tentar de novo".
      if (erro.status === 0 || erro.status === 503) {
        setPendente({ ...local, status: "falhou" });
        return;
      }
      const texto =
        erro.code === "TOO_MANY_REQUESTS"
          ? `Muitas perguntas seguidas. Tente de novo em ${Number(erro.details.retryAfter) || 60} segundos.`
          : erro.message;
      avisar({ texto });
      setPendente(null);
      setRascunho(pergunta);
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

  const naoExiste = (erro: unknown) => erro != null && comoApiError(erro).status === 404;
  if (perdida || naoExiste(conversa.error) || naoExiste(mensagens.error)) {
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

      <main className="flex-1 px-5 pt-4">
        <p className="sr-only" aria-live="polite">
          {anuncio}
        </p>
        {offline ? <OfflineNotice /> : null}

        {mensagens.isError ? (
          <ErrorState
            titulo="Não foi possível carregar a conversa"
            descricao="Suas mensagens estão salvas. Só a conexão falhou agora."
            aoTentarDeNovo={() => void mensagens.refetch()}
          />
        ) : mensagens.isPending ? (
          <div className="flex flex-col gap-4" role="status" aria-label="Carregando a conversa">
            <Skeleton className="ml-auto h-12 w-2/3 rounded-[18px]" />
            <Skeleton className="h-24 rounded-[18px]" />
          </div>
        ) : vazia ? (
          <EstadoInicial nome={perfil.data?.preferredName} aoEscolher={(q) => void enviar(q)} />
        ) : (
          // Ao abrir uma conversa antiga, só as últimas mensagens se movem; o histórico já chega parado.
          <div className="flex flex-col gap-4 [&>*:not(:nth-last-child(-n+3))]:animate-none [&>*:not(:nth-last-child(-n+3))_*]:animate-none">
            {mensagens.hasNextPage ? (
              <button
                type="button"
                onClick={() => {
                  alturaAntes.current = document.documentElement.scrollHeight;
                  void mensagens.fetchNextPage();
                }}
                className="mx-auto h-9 rounded-full px-4 text-[13px] font-semibold text-mata"
              >
                Ver mensagens anteriores
              </button>
            ) : null}
            {lista.map((m) =>
              m.role === "user" ? (
                <PerguntaBubble key={m.id} texto={m.content} />
              ) : (
                <RespostaBubble
                  key={m.id}
                  mensagem={m}
                  aplicando={aplicando === m.id}
                  aoAgir={(a) => agir(a, m)}
                  rodape={<Avaliacao alvo={{ tipo: "nutri_message", id: m.id }} inicial={m.rating} variante="resposta" />}
                />
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
      <SuggestionList sugestoes={sugestoes.data ?? []} aoEscolher={aoEscolher} />
    </>
  );
}
