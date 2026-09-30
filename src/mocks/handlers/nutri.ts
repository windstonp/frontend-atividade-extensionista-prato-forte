import { http, HttpResponse } from 'msw';
import { contextoApi, sugestoesApi } from '../fixtures/nutri';
import { url } from './auth';

/** Padrão: sem conversas; contexto e sugestões da Camila. */
export const handlersNutri = [
  http.get(url('/conversations'), () => HttpResponse.json({ data: [], meta: { next_cursor: null, per_page: 15 } })),
  http.get(url('/nutri/context'), () => HttpResponse.json({ data: { lines: contextoApi } })),
  http.get(url('/nutri/suggestions'), () => HttpResponse.json({ data: sugestoesApi })),
];

/** `GET /conversations/{id}/messages` com estas mensagens (mais recentes primeiro). */
export const respondendoMensagens = (id: number, mensagens: unknown[], proximo: string | null = null) =>
  http.get(url(`/conversations/${id}/messages`), () => HttpResponse.json({ data: mensagens, meta: { next_cursor: proximo, per_page: 30 } }));
