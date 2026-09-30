import type { Dia } from '@/features/dia/tipos';
import type { Conversa, LinhaContexto, Mensagem, MensagemNutri, MensagemUsuario, Pagina, SugestaoPergunta } from '@/features/nutri/tipos';
import { api } from './client';

type Dados<T> = { data: T };
const comCursor = (caminho: string, cursor?: string | null) => (cursor ? `${caminho}?cursor=${encodeURIComponent(cursor)}` : caminho);

/** GET /conversations — 15 por página, mais recentes primeiro. */
export const getConversas = (cursor?: string | null) => api<Pagina<Conversa>>(comCursor('/conversations', cursor));

/** POST /conversations — reaproveita a vazia (200) ou cria (201). */
export const novaConversa = () => api<Dados<Conversa>>('/conversations', { method: 'POST' }).then((r) => r.data);

export const getConversa = (id: number) => api<Dados<Conversa>>(`/conversations/${id}`).then((r) => r.data);

export const apagarConversa = (id: number) => api<void>(`/conversations/${id}`, { method: 'DELETE' });

/** GET /conversations/{id}/messages — 30 por página, mais recentes primeiro. */
export const getMensagens = (id: number, cursor?: string | null) => api<Pagina<Mensagem>>(comCursor(`/conversations/${id}/messages`, cursor));

/** POST /conversations/{id}/messages — as duas mensagens gravadas. */
export const perguntar = (id: number, content: string) =>
  api<Dados<{ userMessage: MensagemUsuario; assistantMessage: MensagemNutri }>>(`/conversations/${id}/messages`, {
    method: 'POST',
    body: { content },
  }).then((r) => r.data);

/** POST /messages/{id}/actions/{i} — aplicar ou dispensar. */
export const resolverAcao = (mensagemId: number, indice: number) =>
  api<Dados<{ message: { id: number }; confirmation?: MensagemNutri; day?: Dia }>>(`/messages/${mensagemId}/actions/${indice}`, {
    method: 'POST',
  }).then((r) => r.data);

export const getContexto = () => api<Dados<{ lines: LinhaContexto[] }>>('/nutri/context').then((r) => r.data.lines);

export const getSugestoes = () => api<Dados<SugestaoPergunta[]>>('/nutri/suggestions').then((r) => r.data);
