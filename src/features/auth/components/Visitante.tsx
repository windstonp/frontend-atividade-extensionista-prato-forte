'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/Toaster';
import { useRedirecionarSeLogado } from '../hooks';

/** Nas telas de visitante: quem já tem sessão vai para o app. Não desenha nada. */
export function RedirecionarSeLogado() {
  useRedirecionarSeLogado();
  return null;
}

/** Depois de apagar a conta (recarga em `/?conta=apagada`): avisa e limpa a URL. */
export function AvisoDeSaida() {
  const apagada = useSearchParams().get('conta') === 'apagada';
  const avisar = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!apagada) return;
    avisar({ texto: 'Sua conta foi apagada.' });
    router.replace('/');
  }, [apagada, avisar, router]);

  return null;
}
