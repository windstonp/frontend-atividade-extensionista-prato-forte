'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toaster';
import type { EfeitoNoPlano } from '@/features/onboarding/tipos';
import { CHAVES } from '@/lib/chaves';
import { usePedirPlano } from './hooks';

const GERANDO = (id: number) => `/onboarding/gerando?plano=${id}&voltar=${encodeURIComponent('/perfil')}`;

/** RN21 — o que a tela faz depois de salvar uma mudança do Perfil. */
export function useEfeitoNoPlano() {
  const router = useRouter();
  const avisar = useToast();
  const cliente = useQueryClient();
  const pedir = usePedirPlano();

  return useCallback(
    (meta: { planEffect: EfeitoNoPlano; planId: number | null }, opcoes: { aviso?: string } = {}) => {
      if (meta.planEffect !== 'none') void cliente.invalidateQueries({ queryKey: CHAVES.dias });

      if (meta.planEffect === 'regeneration_started' && meta.planId !== null) {
        router.push(GERANDO(meta.planId));
        return;
      }
      if (meta.planEffect === 'regeneration_suggested') {
        avisar({
          texto: opcoes.aviso ?? 'Salvo. Quer refazer seu plano com isso?',
          acao: {
            rotulo: 'Refazer',
            onClick: () => void pedir.mutateAsync().then((id) => router.push(GERANDO(id))),
          },
        });
      } else {
        avisar({ texto: opcoes.aviso ?? (meta.planEffect === 'times_updated' ? 'Horários das refeições atualizados' : 'Salvo.') });
      }
      router.push('/perfil');
    },
    [avisar, cliente, pedir, router],
  );
}
