import type { Periodo, Pesagem, Progresso } from '@/features/progresso/tipos';
import { api } from './client';

type Dados<T> = { data: T };

/** GET /progress?period=6w|3m|all */
export const getProgresso = (periodo: Periodo) => api<Dados<Progresso>>(`/progress?period=${periodo}`).then((r) => r.data);

/** GET /weigh-ins — ordem crescente de data. */
export const getPesagens = () => api<Dados<Pesagem[]>>('/weigh-ins').then((r) => r.data);

/** POST /weigh-ins — a de hoje; na mesma data, substitui (RN34). */
export const registrarPeso = (weightKg: number) =>
  api<{ data: Pesagem; meta: { replaced: boolean } }>('/weigh-ins', { method: 'POST', body: { weightKg } });
