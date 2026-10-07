import type { AlimentoBusca, AlimentoProprioDados } from '@/features/dia/tipos';
import { api } from './client';

type Dados<T> = { data: T };

/** GET /foods?q= — catálogo ativo + alimentos próprios (RN50). */
export const buscarAlimentos = (q: string, signal?: AbortSignal) =>
  api<Dados<AlimentoBusca[]>>(`/foods?q=${encodeURIComponent(q)}`, { signal }).then((r) => r.data);

/** GET /foods/recent — até 8 mais registrados em 30 dias. */
export const alimentosRecentes = () => api<Dados<AlimentoBusca[]>>('/foods/recent').then((r) => r.data);

export const criarAlimentoProprio = (dados: AlimentoProprioDados) =>
  api<Dados<AlimentoBusca>>('/custom-foods', { method: 'POST', body: dados }).then((r) => r.data);

export const editarAlimentoProprio = (id: number, dados: Partial<AlimentoProprioDados>) =>
  api<Dados<AlimentoBusca>>(`/custom-foods/${id}`, { method: 'PATCH', body: dados }).then((r) => r.data);

export const apagarAlimentoProprio = (id: number) => api<void>(`/custom-foods/${id}`, { method: 'DELETE' });
