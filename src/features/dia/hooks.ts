'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toaster';
import * as diaApi from '@/lib/api/dia';
import * as planos from '@/lib/api/planos';
import { CHAVES } from '@/lib/chaves';
import { recalcularDia } from './regras';
import type { Dia, Slot } from './tipos';

export const ERRO_AO_MARCAR = 'Não foi possível salvar. Tente de novo.';

export const useDia = (data = 'today') => useQuery({ queryKey: CHAVES.dia(data), queryFn: () => diaApi.getDia(data) });

/** RF13 — otimista: muda na hora, desfaz se a API falhar, fica com a resposta do servidor. */
export function useMarcarRefeicao() {
  const cliente = useQueryClient();
  const avisar = useToast();
  const chave = CHAVES.dia('today');

  return useMutation({
    mutationFn: ({ slot, done }: { slot: Slot; done: boolean }) => diaApi.marcarRefeicao(slot, done),
    onMutate: async ({ slot, done }) => {
      await cliente.cancelQueries({ queryKey: chave });
      const anterior = cliente.getQueryData<Dia>(chave);
      if (anterior) cliente.setQueryData<Dia>(chave, recalcularDia(anterior, slot, done));
      return { anterior };
    },
    onError: (_erro, _vars, contexto) => {
      if (contexto?.anterior) cliente.setQueryData(chave, contexto.anterior);
      avisar({ texto: ERRO_AO_MARCAR });
    },
    onSuccess: (dia) => cliente.setQueryData(chave, dia),
  });
}

export const useSubstituicoes = (itemId: number | null) =>
  useQuery({
    queryKey: ['substituicoes', itemId],
    queryFn: () => diaApi.getSubstituicoes(itemId as number),
    enabled: itemId !== null,
    staleTime: 0,
  });

export function useTrocarItem() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, foodId }: { itemId: number; foodId: number }) => diaApi.trocarItem(itemId, foodId),
    onSuccess: (dia) => cliente.setQueryData(CHAVES.dia('today'), dia),
  });
}

export function useDesfazer() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: diaApi.desfazer,
    onSuccess: (dia) => cliente.setQueryData(CHAVES.dia('today'), dia),
  });
}

/** Acompanha a geração: consulta a cada 1,5 s enquanto `pending`/`generating` (e só com a tela aberta). */
export const usePlano = (id: number | null) =>
  useQuery({
    queryKey: CHAVES.plano(id ?? 0),
    queryFn: () => planos.getPlano(id as number),
    enabled: id !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'ready' || status === 'failed' ? false : 1500;
    },
    refetchIntervalInBackground: false,
  });

/** Pede um plano novo; o id volta mesmo quando já há um gerando. Os dias em cache caducam. */
export function usePedirPlano() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: planos.pedirPlano,
    onSuccess: () => void cliente.invalidateQueries({ queryKey: CHAVES.dias }),
  });
}
