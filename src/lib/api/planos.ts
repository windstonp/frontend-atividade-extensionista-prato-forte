import type { Plano } from '@/features/dia/tipos';
import { api } from './client';
import { ApiError } from './errors';

type Dados<T> = { data: T };

/** GET /plans/{plan} */
export const getPlano = (id: number) => api<Dados<Plano>>(`/plans/${id}`).then((r) => r.data);

/** GET /plans/active */
export const getPlanoAtivo = () => api<Dados<Plano>>('/plans/active').then((r) => r.data);

/** POST /plans → id do plano novo; se já há um gerando (409), o id dele (RN19). */
export async function pedirPlano(): Promise<number> {
  try {
    return (await api<Dados<{ id: number }>>('/plans', { method: 'POST' })).data.id;
  } catch (erro) {
    const emAndamento = erro instanceof ApiError && erro.code === 'PLAN_ALREADY_GENERATING' ? erro.details.planId : null;
    if (typeof emAndamento === 'number') return emAndamento;
    throw erro;
  }
}
