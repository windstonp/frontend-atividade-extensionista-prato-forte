import type { Alvo, RespostaUsabilidade, StatusUsabilidade, ValorAvaliacao } from '@/features/validacao/tipos';
import { api } from './client';

type Dados<T> = { data: T };
const corpo = (alvo: Alvo) => ({ rateableType: alvo.tipo, rateableId: alvo.id });

/** PUT /ratings — avaliar de novo substitui (RN40). */
export const avaliar = (alvo: Alvo, value: ValorAvaliacao, comment: string | null = null) =>
  api<unknown>('/ratings', { method: 'PUT', body: { ...corpo(alvo), value, comment } });

/** DELETE /ratings — idempotente. */
export const removerAvaliacao = (alvo: Alvo) => api<void>('/ratings', { method: 'DELETE', body: corpo(alvo) });

export const getStatusUsabilidade = () => api<Dados<StatusUsabilidade>>('/usability-responses/status').then((r) => r.data);

export const responderQuestionario = (resposta: RespostaUsabilidade) =>
  api<Dados<{ round: string; responded: true }>>('/usability-responses', { method: 'POST', body: resposta }).then((r) => r.data);

export const dispensarConvite = () => api<void>('/usability-responses/dismiss', { method: 'POST' });
