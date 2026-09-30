'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toaster';
import { CHAVE_ME } from '@/features/auth/hooks';
import * as configuracoes from '@/lib/api/configuracoes';
import { comoApiError } from '@/lib/api/errors';
import { CHAVES } from '@/lib/chaves';
import type { User } from '@/lib/types';
import type { Configuracoes, MudancaConfiguracoes } from './tipos';

export const useConfiguracoes = () => useQuery({ queryKey: CHAVES.configuracoes, queryFn: configuracoes.getConfiguracoes });

const aplicar = (atual: Configuracoes, mudanca: MudancaConfiguracoes): Configuracoes => ({
  ...atual,
  unitSystem: mudanca.unitSystem ?? atual.unitSystem,
  notifications: { ...atual.notifications, ...mudanca.notifications },
});

/** Otimista: muda na hora; se o servidor recusar, volta e avisa. A unidade também vai para o `['me']`. */
export function useSalvarConfiguracoes() {
  const cliente = useQueryClient();
  const avisar = useToast();
  return useMutation({
    mutationFn: configuracoes.salvarConfiguracoes,
    onMutate: async (mudanca: MudancaConfiguracoes) => {
      await cliente.cancelQueries({ queryKey: CHAVES.configuracoes });
      const antes = cliente.getQueryData<Configuracoes>(CHAVES.configuracoes);
      if (antes) cliente.setQueryData(CHAVES.configuracoes, aplicar(antes, mudanca));
      return { antes };
    },
    onError: (erro, _mudanca, contexto) => {
      if (contexto?.antes) cliente.setQueryData(CHAVES.configuracoes, contexto.antes);
      avisar({ texto: comoApiError(erro).message });
    },
    onSuccess: (salvas) => {
      cliente.setQueryData(CHAVES.configuracoes, salvas);
      cliente.setQueryData<User>(CHAVE_ME, (eu) => (eu ? { ...eu, settings: { ...eu.settings, unitSystem: salvas.unitSystem } } : eu));
    },
  });
}
