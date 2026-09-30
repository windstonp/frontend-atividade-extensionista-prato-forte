import type { Dia, Slot, Substituicoes } from '@/features/dia/tipos';
import { api } from './client';

type Dados<T> = { data: T };

/** GET /days/{date} — `today` ou `YYYY-MM-DD`. */
export const getDia = (data = 'today') => api<Dados<Dia>>(`/days/${data}`).then((r) => r.data);

// Escritas levam a data do dia que está na tela (não `today`): depois da meia-noite, a API
// recusa com DAY_NOT_EDITABLE em vez de gravar no dia seguinte (RN23).

/** PATCH /days/{date}/meals/{slot} */
export const marcarRefeicao = (data: string, slot: Slot, done: boolean) =>
  api<Dados<Dia>>(`/days/${data}/meals/${slot}`, { method: 'PATCH', body: { done } }).then((r) => r.data);

/** GET /days/{date}/items/{item}/substitutions */
export const getSubstituicoes = (data: string, itemId: number) =>
  api<Dados<Substituicoes>>(`/days/${data}/items/${itemId}/substitutions`).then((r) => r.data);

/** POST /days/{date}/items/{item}/swap — as gramas são as do servidor (RN25). */
export const trocarItem = (data: string, itemId: number, foodId: number) =>
  api<Dados<Dia>>(`/days/${data}/items/${itemId}/swap`, { method: 'POST', body: { foodId } }).then((r) => r.data);

/** POST /days/{date}/undo */
export const desfazer = (data: string) => api<Dados<Dia>>(`/days/${data}/undo`, { method: 'POST' }).then((r) => r.data);
