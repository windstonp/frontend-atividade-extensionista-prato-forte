'use client';

import { useIsMutating, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toaster';
import * as diaApi from '@/lib/api/dia';
import { comoApiError } from '@/lib/api/errors';
import * as planos from '@/lib/api/planos';
import { CHAVES } from '@/lib/chaves';
import { recalcularDia } from './regras';
import type { Dia, Slot } from './tipos';

export const ERRO_AO_MARCAR = 'Não foi possível salvar. Tente de novo.';
export const DIA_VIROU = 'O dia virou. Atualizamos para hoje.';

const HOJE = CHAVES.dia('today');
const MARCAR = ['marcar-refeicao'];

/** Hoje volta a ser buscado ao voltar para a aba: um app aberto de ontem não mostra o dia velho. */
export const useDia = (data = 'today') =>
  useQuery({ queryKey: CHAVES.dia(data), queryFn: () => diaApi.getDia(data), refetchOnWindowFocus: data === 'today' });

/** A data do dia que está na tela — as escritas vão para ela, nunca para `today` (RN23). */
const dataNaTela = (cliente: QueryClient) => cliente.getQueryData<Dia>(HOJE)?.date ?? 'today';

/** Depois da meia-noite a API recusa escrever no dia de ontem: avisa e traz o dia novo. */
function diaVirou(erro: unknown, cliente: QueryClient, avisar: ReturnType<typeof useToast>): boolean {
  if (comoApiError(erro).code !== 'DAY_NOT_EDITABLE') return false;
  avisar({ texto: DIA_VIROU });
  void cliente.invalidateQueries({ queryKey: CHAVES.dias });
  return true;
}

/**
 * RF13 — otimista: muda na hora, desfaz se a API falhar, fica com a resposta do servidor.
 * Uma marcação por vez (`useMarcandoRefeicao` trava os botões): respostas fora de ordem não sobrescrevem a última.
 */
export function useMarcarRefeicao() {
  const cliente = useQueryClient();
  const avisar = useToast();

  return useMutation({
    mutationKey: MARCAR,
    mutationFn: ({ slot, done }: { slot: Slot; done: boolean }) => diaApi.marcarRefeicao(dataNaTela(cliente), slot, done),
    onMutate: async ({ slot, done }) => {
      await cliente.cancelQueries({ queryKey: HOJE });
      const anterior = cliente.getQueryData<Dia>(HOJE);
      if (anterior) cliente.setQueryData<Dia>(HOJE, recalcularDia(anterior, slot, done));
      return { anterior };
    },
    onError: (erro, _vars, contexto) => {
      if (contexto?.anterior) cliente.setQueryData(HOJE, contexto.anterior);
      if (!diaVirou(erro, cliente, avisar)) avisar({ texto: ERRO_AO_MARCAR });
    },
    onSuccess: (dia) => cliente.setQueryData(HOJE, dia),
  });
}

export const useMarcandoRefeicao = () => useIsMutating({ mutationKey: MARCAR }) > 0;

export function useSubstituicoes(itemId: number | null) {
  const cliente = useQueryClient();
  return useQuery({
    queryKey: ['substituicoes', itemId],
    queryFn: () => diaApi.getSubstituicoes(dataNaTela(cliente), itemId as number),
    enabled: itemId !== null,
    staleTime: 0,
  });
}

export function useTrocarItem() {
  const cliente = useQueryClient();
  const avisar = useToast();
  return useMutation({
    mutationFn: ({ itemId, foodId }: { itemId: number; foodId: number }) => diaApi.trocarItem(dataNaTela(cliente), itemId, foodId),
    onSuccess: (dia) => cliente.setQueryData(HOJE, dia),
    onError: (erro) => void diaVirou(erro, cliente, avisar),
  });
}

export function useDesfazer() {
  const cliente = useQueryClient();
  const avisar = useToast();
  return useMutation({
    mutationFn: () => diaApi.desfazer(dataNaTela(cliente)),
    onSuccess: (dia) => cliente.setQueryData(HOJE, dia),
    onError: (erro) => void diaVirou(erro, cliente, avisar),
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

/** "Tentar de novo" de quem ficou sem plano: pede outro e abre o Gerando; o erro vira aviso. */
export function useTentarPlanoDeNovo(voltar: string) {
  const router = useRouter();
  const avisar = useToast();
  const pedir = usePedirPlano();
  return {
    tentando: pedir.isPending,
    tentar: async () => {
      try {
        const id = await pedir.mutateAsync();
        router.push(`/onboarding/gerando?plano=${id}&voltar=${encodeURIComponent(voltar)}`);
      } catch (erro) {
        avisar({ texto: comoApiError(erro).message });
      }
    },
  };
}
