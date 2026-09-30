import type { Dia, Slot, Substituicoes } from '@/features/dia/tipos';
import { api } from './client';

type Dados<T> = { data: T };

/** GET /days/{date} — `today` ou `YYYY-MM-DD`. */
export const getDia = (data = 'today') => api<Dados<Dia>>(`/days/${data}`).then((r) => r.data);

/** PATCH /days/today/meals/{slot} */
export const marcarRefeicao = (slot: Slot, done: boolean) =>
  api<Dados<Dia>>(`/days/today/meals/${slot}`, { method: 'PATCH', body: { done } }).then((r) => r.data);

/** GET /days/today/items/{item}/substitutions */
export const getSubstituicoes = (itemId: number) =>
  api<Dados<Substituicoes>>(`/days/today/items/${itemId}/substitutions`).then((r) => r.data);

/** POST /days/today/items/{item}/swap — as gramas são as do servidor (RN25). */
export const trocarItem = (itemId: number, foodId: number) =>
  api<Dados<Dia>>(`/days/today/items/${itemId}/swap`, { method: 'POST', body: { foodId } }).then((r) => r.data);

/** POST /days/today/undo */
export const desfazer = () => api<Dados<Dia>>('/days/today/undo', { method: 'POST' }).then((r) => r.data);
