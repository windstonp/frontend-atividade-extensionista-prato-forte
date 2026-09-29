'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPerfil, salvarPreferencias } from '@/lib/api/perfil';
import { CHAVES } from '@/lib/chaves';

export const usePerfil = () => useQuery({ queryKey: CHAVES.perfil, queryFn: getPerfil });

export function useSalvarPreferencias() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: salvarPreferencias,
    onSuccess: (resposta) => {
      cliente.setQueryData(CHAVES.perfil, resposta.data);
      void cliente.invalidateQueries({ queryKey: CHAVES.onboarding });
    },
  });
}
