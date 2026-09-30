import { http, HttpResponse } from 'msw';
import { configuracoesApi } from '../fixtures/configuracoes';
import { url } from './auth';

/** Padrão: configurações do RN38; o PUT devolve o que recebeu aplicado ao padrão. */
export const handlersConfiguracoes = [
  http.get(url('/settings'), () => HttpResponse.json({ data: configuracoesApi() })),
  http.put(url('/settings'), async ({ request }) => {
    const corpo = (await request.json()) as { unit_system?: string; notifications?: Record<string, boolean> };
    return HttpResponse.json({ data: configuracoesApi({ unit_system: corpo.unit_system, ...corpo.notifications }) });
  }),
  http.post(url('/push-subscriptions'), () => HttpResponse.json({ data: { subscribed: true } }, { status: 201 })),
  http.delete(url('/push-subscriptions'), () => new HttpResponse(null, { status: 204 })),
];
