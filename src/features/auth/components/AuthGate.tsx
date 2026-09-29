'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { ErrorState } from '@/components/app/ErrorState';
import { Screen } from '@/components/app/Screen';
import { TelaCarregando } from '@/components/app/TelaCarregando';
import { type Area, destinoDoGuarda } from '../destino';
import { useMe } from '../hooks';

/** Guarda dos layouts autenticados: sessão, onboarding e destino (RN07). */
export function AuthGate({ area, children }: { area: Area; children: React.ReactNode }) {
  const { data: user, error, isPending, refetch } = useMe();
  const router = useRouter();
  const caminho = usePathname();
  const busca = useSearchParams().toString();
  const destino = destinoDoGuarda({ area, user, erro: error, caminho, busca });

  useEffect(() => {
    if (destino) router.replace(destino);
  }, [destino, router]);

  if (isPending || destino) return <TelaCarregando />;

  if (error) {
    return (
      <Screen>
        <ErrorState
          titulo="Não deu para abrir o app"
          descricao={error.message}
          aoTentarDeNovo={() => void refetch()}
        />
      </Screen>
    );
  }

  return <>{children}</>;
}
