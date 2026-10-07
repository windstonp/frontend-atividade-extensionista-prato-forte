'use client';

import { type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Dia } from '@/features/dia/tipos';
import * as nutri from '@/lib/api/nutri';
import { CHAVES } from '@/lib/chaves';
import type { Conversa, Mensagem, MensagemNutri, Pagina } from './tipos';

export const useConversas = () =>
  useInfiniteQuery({
    queryKey: CHAVES.conversas,
    queryFn: ({ pageParam }) => nutri.getConversas(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (ultima) => ultima.meta.nextCursor,
  });

export function useNovaConversa() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: nutri.novaConversa,
    onSuccess: () => void cliente.invalidateQueries({ queryKey: CHAVES.conversas }),
  });
}

/** Some da lista na hora; volta se a API falhar. */
export function useApagarConversa() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: nutri.apagarConversa,
    onMutate: async (id: number) => {
      await cliente.cancelQueries({ queryKey: CHAVES.conversas });
      const antes = cliente.getQueryData<InfiniteData<Pagina<Conversa>>>(CHAVES.conversas);
      if (antes) {
        cliente.setQueryData<InfiniteData<Pagina<Conversa>>>(CHAVES.conversas, {
          ...antes,
          pages: antes.pages.map((p) => ({ ...p, data: p.data.filter((c) => c.id !== id) })),
        });
      }
      return { antes };
    },
    onError: (_e, _id, contexto) => {
      if (contexto?.antes) cliente.setQueryData(CHAVES.conversas, contexto.antes);
    },
  });
}

export const useConversa = (id: number) => useQuery({ queryKey: CHAVES.conversa(id), queryFn: () => nutri.getConversa(id), retry: false });

export const useMensagens = (id: number) =>
  useInfiniteQuery({
    queryKey: CHAVES.mensagens(id),
    queryFn: ({ pageParam }) => nutri.getMensagens(id, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (ultima) => ultima.meta.nextCursor,
    retry: false,
  });

/** Põe mensagens novas no começo da primeira página (a mais recente). */
function acrescentar(cliente: ReturnType<typeof useQueryClient>, conversaId: number, novas: Mensagem[]) {
  cliente.setQueryData<InfiniteData<Pagina<Mensagem>>>(CHAVES.mensagens(conversaId), (atual) => {
    if (!atual) return atual;
    const [primeira, ...resto] = atual.pages;
    return { ...atual, pages: [{ ...primeira, data: [...[...novas].reverse(), ...primeira.data] }, ...resto] };
  });
}

export function usePerguntar(conversaId: number) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => nutri.perguntar(conversaId, content),
    onSuccess: ({ userMessage, assistantMessage }) => {
      acrescentar(cliente, conversaId, [userMessage, assistantMessage]);
      void cliente.invalidateQueries({ queryKey: CHAVES.conversas });
    },
  });
}

/** Aplicar/dispensar: as ações da mensagem somem; a confirmação entra; o dia de hoje vem atualizado. */
export function useResolverAcao(conversaId: number) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ mensagem, indice }: { mensagem: MensagemNutri; indice: number }) => nutri.resolverAcao(mensagem.id, indice),
    onSuccess: ({ confirmation, day }, { mensagem }) => {
      cliente.setQueryData<InfiniteData<Pagina<Mensagem>>>(CHAVES.mensagens(conversaId), (atual) =>
        atual && {
          ...atual,
          pages: atual.pages.map((p) => ({
            ...p,
            data: p.data.map((m) => (m.id === mensagem.id && m.role === 'assistant' ? { ...m, actions: [], actionsAvailable: false } : m)),
          })),
        },
      );
      if (confirmation) acrescentar(cliente, conversaId, [confirmation]);
      if (day) cliente.setQueryData<Dia>(CHAVES.dia('today'), day);
      // A prévia da conversa e o contexto (próxima refeição, o que já comeu) mudaram.
      void cliente.invalidateQueries({ queryKey: CHAVES.conversas });
      void cliente.invalidateQueries({ queryKey: CHAVES.contextoNutri });
    },
    onError: () => void cliente.invalidateQueries({ queryKey: CHAVES.mensagens(conversaId) }),
  });
}

export const useContexto = () => useQuery({ queryKey: CHAVES.contextoNutri, queryFn: nutri.getContexto });
export const useSugestoes = () => useQuery({ queryKey: CHAVES.sugestoesNutri, queryFn: nutri.getSugestoes });
