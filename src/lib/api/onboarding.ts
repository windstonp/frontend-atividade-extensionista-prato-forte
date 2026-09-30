import type { Catalogo, DadosOnboarding, EtapaEditavel, MetaDaResposta, Previa } from '@/features/onboarding/tipos';
import { api } from './client';

type Dados<T> = { data: T };

/** GET /catalog/onboarding — opções de todas as etapas. */
export const getCatalogo = () => api<Dados<Catalogo>>('/catalog/onboarding').then((r) => r.data);

/** GET /onboarding — respostas salvas e próxima etapa. */
export const getOnboarding = () => api<Dados<DadosOnboarding>>('/onboarding').then((r) => r.data);

/** PATCH /profile/steps/{etapa} */
export const salvarEtapa = (etapa: EtapaEditavel, corpo: Record<string, unknown>) =>
  api<Dados<DadosOnboarding> & { meta: MetaDaResposta }>(`/profile/steps/${etapa}`, { method: 'PATCH', body: corpo });

/** POST /onboarding/complete — 202 com o plano que começou a ser gerado (200 e o mesmo plano se já concluído). */
export const concluirOnboarding = () =>
  api<Dados<{ plan: { id: number; status: string } }>>('/onboarding/complete', { method: 'POST' }).then((r) => r.data);

/** GET /plans/preview-targets — prévia das metas (RN13). */
export const getPrevia = () => api<Dados<Previa>>('/plans/preview-targets').then((r) => r.data);
