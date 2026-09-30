import { http, HttpResponse } from 'msw';
import { pesagensApi, progressoApi } from '../fixtures/progresso';
import { url } from './auth';

/** Padrão: a evolução da Camila e as 6 pesagens. */
export const handlersProgresso = [
  http.get(url('/progress'), () => HttpResponse.json({ data: progressoApi() })),
  http.get(url('/weigh-ins'), () => HttpResponse.json({ data: pesagensApi })),
];

export const respondendoProgresso = (corpo: ReturnType<typeof progressoApi>) =>
  http.get(url('/progress'), () => HttpResponse.json({ data: corpo }));
