import { http, HttpResponse } from 'msw';
import { statusUsabilidadeApi } from '../fixtures/validacao';
import { url } from './auth';

/** Padrão: sem convite; avaliar e responder dão certo. */
export const handlersValidacao = [
  http.put(url('/ratings'), () => HttpResponse.json({ data: {} })),
  http.delete(url('/ratings'), () => new HttpResponse(null, { status: 204 })),
  http.get(url('/usability-responses/status'), () => HttpResponse.json({ data: statusUsabilidadeApi() })),
  http.post(url('/usability-responses'), () => HttpResponse.json({ data: { round: '2026-1', responded: true } }, { status: 201 })),
  http.post(url('/usability-responses/dismiss'), () => new HttpResponse(null, { status: 204 })),
];
