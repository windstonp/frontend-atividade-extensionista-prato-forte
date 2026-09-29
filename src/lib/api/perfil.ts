import type { EntradaPreferencias, Perfil, RespostaPreferencias } from '@/features/perfil/tipos';
import { api } from './client';

/** GET /profile */
export const getPerfil = () => api<{ data: Perfil }>('/profile').then((r) => r.data);

/** PUT /profile/preferences */
export const salvarPreferencias = (entrada: EntradaPreferencias) =>
  api<RespostaPreferencias>('/profile/preferences', { method: 'PUT', body: entrada });
