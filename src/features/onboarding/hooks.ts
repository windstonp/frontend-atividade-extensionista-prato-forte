'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CHAVE_ME } from '@/features/auth/hooks';
import * as onboarding from '@/lib/api/onboarding';
import { CHAVES } from '@/lib/chaves';
import type { EtapaEditavel } from './tipos';

/** O catálogo só muda com deploy: busca uma vez por sessão. */
export const useCatalogo = () => useQuery({ queryKey: CHAVES.catalogo, queryFn: onboarding.getCatalogo, staleTime: Infinity });

export const useDadosOnboarding = () => useQuery({ queryKey: CHAVES.onboarding, queryFn: onboarding.getOnboarding });

export function useSalvarEtapa(etapa: EtapaEditavel) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (corpo: Record<string, unknown>) => onboarding.salvarEtapa(etapa, corpo),
    onSuccess: (resposta) => {
      cliente.setQueryData(CHAVES.onboarding, resposta.data);
      cliente.removeQueries({ queryKey: CHAVES.previa });
      void cliente.invalidateQueries({ queryKey: CHAVE_ME }); // next_step e nome preferido mudam
      void cliente.invalidateQueries({ queryKey: CHAVES.perfil });
    },
  });
}

/** A prévia falhar não impede gerar o plano: sem novas tentativas. */
export const usePrevia = () => useQuery({ queryKey: CHAVES.previa, queryFn: onboarding.getPrevia, retry: false });

/** Quem chama navega com recarga (`recarregarEm`), que descarta o `['me']` de onboarding incompleto. */
export const useConcluirOnboarding = () => useMutation({ mutationFn: onboarding.concluirOnboarding });
