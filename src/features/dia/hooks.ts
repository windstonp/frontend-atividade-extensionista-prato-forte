'use client';

import { keepPreviousData, useIsMutating, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toaster';
import * as alimentos from '@/lib/api/alimentos';
import * as diaApi from '@/lib/api/dia';
import { comoApiError } from '@/lib/api/errors';
import * as planos from '@/lib/api/planos';
import { CHAVES } from '@/lib/chaves';
import { registrarSugestaoOtimista } from './registro';
import type { AlimentoProprioDados, Dia, NovaEntrada, Registro, Slot } from './tipos';

export const ERRO_AO_SALVAR = 'Não foi possível salvar. Tente de novo.';
export const DIA_VIROU = 'O dia virou. Atualizamos para hoje.';

const HOJE = CHAVES.dia('today');

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

const REGISTRAR = ['registrar'];

/** A data do dia na tela (para escrever nela, nunca em `today` — RN23). */
const dataDe = (cliente: QueryClient, chave: string) => cliente.getQueryData<Dia>(CHAVES.dia(chave))?.date ?? chave;

/** Outros caches que mostram consumido: Dieta (por data), Evolução, contexto do Nutri. */
function depoisDeRegistrar(cliente: QueryClient, chave: string, dia: Dia) {
  cliente.setQueryData(CHAVES.dia(chave), dia);
  void cliente.invalidateQueries({ queryKey: CHAVES.dias, predicate: (q) => q.queryKey[1] !== chave });
  void cliente.invalidateQueries({ queryKey: CHAVES.progressos });
  void cliente.invalidateQueries({ queryKey: CHAVES.contextoNutri });
  void cliente.invalidateQueries({ queryKey: CHAVES.recentes });
}

/** RF32/RF33 — registrar; o "+" (só itens sugeridos) é otimista. */
export function useRegistrar(chave = 'today') {
  const cliente = useQueryClient();
  const avisar = useToast();
  return useMutation({
    mutationKey: REGISTRAR,
    mutationFn: ({ slot, entries }: { slot: Slot; entries: NovaEntrada[] }) => diaApi.registrar(dataDe(cliente, chave), slot, entries),
    onMutate: async ({ slot, entries }) => {
      const ids = entries.flatMap((e) => ('suggestionItemId' in e && e.amount === undefined ? [e.suggestionItemId] : []));
      if (ids.length !== entries.length) return { anterior: undefined };
      await cliente.cancelQueries({ queryKey: CHAVES.dia(chave) });
      const anterior = cliente.getQueryData<Dia>(CHAVES.dia(chave));
      if (anterior) cliente.setQueryData<Dia>(CHAVES.dia(chave), registrarSugestaoOtimista(anterior, slot, ids));
      return { anterior };
    },
    onError: (erro, _v, contexto) => {
      if (contexto?.anterior) cliente.setQueryData(CHAVES.dia(chave), contexto.anterior);
      if (!diaVirou(erro, cliente, avisar)) avisar({ texto: ERRO_AO_SALVAR });
    },
    onSuccess: (dia) => depoisDeRegistrar(cliente, chave, dia),
  });
}

export const useRegistrando = () => useIsMutating({ mutationKey: REGISTRAR }) > 0;

export function useEditarRegistro(chave = 'today') {
  const cliente = useQueryClient();
  const avisar = useToast();
  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) => diaApi.editarRegistro(dataDe(cliente, chave), id, amount),
    onSuccess: (dia) => depoisDeRegistrar(cliente, chave, dia),
    onError: (erro) => void (diaVirou(erro, cliente, avisar) || avisar({ texto: ERRO_AO_SALVAR })),
  });
}

/** RF34 — remove e oferece "Desfazer" (registra de novo, inclusive o vínculo com a sugestão). */
export function useRemoverRegistro(chave = 'today') {
  const cliente = useQueryClient();
  const avisar = useToast();
  const registrar = useRegistrar(chave);
  return useMutation({
    mutationFn: ({ registro }: { registro: Registro; slot: Slot }) => diaApi.removerRegistro(dataDe(cliente, chave), registro.id),
    onSuccess: (dia, { registro, slot }) => {
      depoisDeRegistrar(cliente, chave, dia);
      const devolver: NovaEntrada = registro.suggestionItemId !== null
        ? { suggestionItemId: registro.suggestionItemId, amount: registro.amount }
        : registro.foodId !== null ? { foodId: registro.foodId, amount: registro.amount } : { customFoodId: registro.customFoodId as number, amount: registro.amount };
      avisar({ texto: `${registro.name} removido`, acao: { rotulo: 'Desfazer', onClick: () => registrar.mutate({ slot, entries: [devolver] }) } });
    },
    onError: (erro) => void (diaVirou(erro, cliente, avisar) || avisar({ texto: ERRO_AO_SALVAR })),
  });
}

/** RF33 — busca com espera de 250 ms; respostas antigas não sobrescrevem (chave com o termo). */
export function useBuscaAlimentos(termo: string) {
  const [termoFirme, setTermoFirme] = useState(''); // até o primeiro termo também espera os 250 ms
  useEffect(() => {
    const t = setTimeout(() => setTermoFirme(termo.trim()), 250);
    return () => clearTimeout(t);
  }, [termo]);
  return useQuery({
    queryKey: [...CHAVES.alimentos, termoFirme],
    queryFn: ({ signal }) => alimentos.buscarAlimentos(termoFirme, signal),
    enabled: termoFirme.length >= 2,
    placeholderData: keepPreviousData,
  });
}

export const useRecentes = (ativo: boolean) =>
  useQuery({ queryKey: CHAVES.recentes, queryFn: alimentos.alimentosRecentes, enabled: ativo, staleTime: 60_000 });

function useAlimentoProprio<A>(fn: (a: A) => Promise<unknown>) {
  const cliente = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => void cliente.invalidateQueries({ queryKey: CHAVES.alimentos }) });
}
export const useCriarAlimentoProprio = () => useAlimentoProprio(alimentos.criarAlimentoProprio);
export const useEditarAlimentoProprio = () => useAlimentoProprio(({ id, dados }: { id: number; dados: Partial<AlimentoProprioDados> }) => alimentos.editarAlimentoProprio(id, dados));
export const useApagarAlimentoProprio = () => useAlimentoProprio(alimentos.apagarAlimentoProprio);

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
