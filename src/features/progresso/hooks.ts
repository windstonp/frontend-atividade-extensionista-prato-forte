'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import * as progresso from '@/lib/api/progresso';
import { CHAVES } from '@/lib/chaves';
import type { Periodo } from './tipos';

/** Trocar de período mantém o gráfico anterior na tela até o novo chegar. */
export const useProgresso = (periodo: Periodo) =>
  useQuery({ queryKey: CHAVES.progresso(periodo), queryFn: () => progresso.getProgresso(periodo), placeholderData: keepPreviousData });

export const usePesagens = () => useQuery({ queryKey: CHAVES.pesagens, queryFn: progresso.getPesagens });

/**
 * CA08: salvar muda a Evolução, o card de Hoje e o Perfil. A Evolução não está montada agora:
 * invalidar só a deixaria mostrar o peso velho na volta — o cache dela sai. O do onboarding também,
 * senão "Dados pessoais" reabre com o peso antigo e, salvo, grava ele por cima da pesagem de hoje.
 */
export function useRegistrarPeso() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: progresso.registrarPeso,
    onSuccess: () => {
      cliente.removeQueries({ queryKey: CHAVES.progressos });
      cliente.removeQueries({ queryKey: CHAVES.onboarding });
      void cliente.invalidateQueries({ queryKey: CHAVES.pesagens });
      void cliente.invalidateQueries({ queryKey: CHAVES.perfil });
    },
  });
}

const CHAVE = 'pf:periodo-evolucao';
const PERIODOS: Periodo[] = ['6w', '3m', 'all'];
const ouvintes = new Set<() => void>();
let naMemoria: Periodo = '6w'; // só quando o navegador não deixa usar o localStorage

function ler(): Periodo {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return PERIODOS.includes(salvo as Periodo) ? (salvo as Periodo) : '6w';
  } catch {
    return naMemoria;
  }
}

function gravar(periodo: Periodo) {
  try {
    localStorage.setItem(CHAVE, periodo);
  } catch {
    naMemoria = periodo; // aba anônima ou storage bloqueado: fica só na memória
  }
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

/** Período da Evolução, lembrado entre visitas (🟡 spec 05 §4 S15). */
export function usePeriodo(): [Periodo, (p: Periodo) => void] {
  return [useSyncExternalStore(assinar, ler, () => '6w' as Periodo), gravar];
}
