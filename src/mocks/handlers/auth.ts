import { http, HttpResponse } from 'msw';

export const API = 'http://localhost:8000';
export const url = (caminho: string) => `${API}/api/v1${caminho}`;

export const erroDaApi = (status: number, code: string, message: string, extra: Record<string, unknown> = {}) =>
  HttpResponse.json({ message, code, ...extra }, { status });

export const semSessao = () => erroDaApi(401, 'UNAUTHENTICATED', 'Sua sessão expirou. Entre de novo.');

/** Padrão: visitante sem sessão. */
export const handlersAuth = [
  http.get(`${API}/sanctum/csrf-cookie`, () => new HttpResponse(null, { status: 204 })),
  http.get(url('/me'), semSessao),
];
