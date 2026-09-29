'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import * as conta from '@/lib/api/auth';
import type { User } from '@/lib/types';
import { destinoAposEntrar } from './destino';

export const CHAVE_ME = ['me'] as const;

export function useMe() {
  return useQuery({ queryKey: CHAVE_ME, queryFn: conta.getMe, staleTime: 60_000 });
}

function useGuardarUsuario() {
  const cliente = useQueryClient();
  return (user: User) => cliente.setQueryData(CHAVE_ME, user);
}

export function useLogin() {
  const guardar = useGuardarUsuario();
  return useMutation({ mutationFn: conta.login, onSuccess: guardar });
}

export function useRegister() {
  const guardar = useGuardarUsuario();
  return useMutation({ mutationFn: conta.register, onSuccess: guardar });
}

/** Sair e apagar a conta terminam com recarga (`recarregarEm`), que limpa todo o cache. */
export const useLogout = () => useMutation({ mutationFn: conta.logout });
export const useDeleteAccount = () => useMutation({ mutationFn: conta.deleteAccount });
export const useForgotPassword = () => useMutation({ mutationFn: conta.forgotPassword });
export const useResetPassword = () => useMutation({ mutationFn: conta.resetPassword });
export const useUpdatePassword = () => useMutation({ mutationFn: conta.updatePassword });

/**
 * Quem já tem sessão não fica nas telas de visitante: vai para o app (ou a etapa pendente).
 * Também é o que navega depois de entrar/criar conta, porque as mutações gravam `['me']`.
 */
export function useRedirecionarSeLogado() {
  const { data: user } = useMe();
  const router = useRouter();
  const voltar = useSearchParams().get('voltar');

  useEffect(() => {
    if (user) router.replace(destinoAposEntrar(user, voltar));
  }, [user, voltar, router]);
}
