import type { Configuracoes, MudancaConfiguracoes } from '@/features/configuracoes/tipos';
import type { InscricaoJson } from '@/lib/push';
import { api } from './client';

type Dados<T> = { data: T };

export const getConfiguracoes = () => api<Dados<Configuracoes>>('/settings').then((r) => r.data);

/** PUT /settings — só o que mudou. */
export const salvarConfiguracoes = (mudanca: MudancaConfiguracoes) =>
  api<Dados<Configuracoes>>('/settings', { method: 'PUT', body: mudanca }).then((r) => r.data);

/** POST /push-subscriptions — upsert por endpoint. */
export const enviarInscricao = (inscricao: InscricaoJson) => api<void>('/push-subscriptions', { method: 'POST', body: inscricao });

/** DELETE /push-subscriptions — idempotente (CA07). */
export const removerInscricao = (endpoint: string) => api<void>('/push-subscriptions', { method: 'DELETE', body: { endpoint } });
