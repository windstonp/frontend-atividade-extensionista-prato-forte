'use client';

import { useMe } from '@/features/auth/hooks';
import { medidas, type Medidas } from './units';

/** As medidas da preferência da pessoa (`['me']`); sem sessão ou sem dado, métrico. */
export function useMedidas(): Medidas {
  const { data } = useMe();
  return medidas(data?.settings?.unitSystem ?? 'metric');
}
