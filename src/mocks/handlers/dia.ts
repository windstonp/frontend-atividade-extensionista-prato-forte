import { http, HttpResponse } from 'msw';
import { diaApi } from '../fixtures/dia';
import { perfilApi } from '../fixtures/onboarding';
import { url } from './auth';

/** Padrão: o dia da Camila (nada feito) e o perfil dela. */
export const handlersDia = [
  http.get(url('/days/today'), () => HttpResponse.json({ data: diaApi() })),
  http.get(url('/profile'), () => HttpResponse.json({ data: perfilApi })),
];

/** `GET /days/{data}` com este corpo (snake_case). */
export const respondendoDia = (dia: ReturnType<typeof diaApi>, data = 'today') =>
  http.get(url(`/days/${data}`), () => HttpResponse.json({ data: dia }));
