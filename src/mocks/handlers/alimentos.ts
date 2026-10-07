import { http, HttpResponse } from 'msw';
import { alimentosApi, recentesApi } from '../fixtures/alimentos';
import { url } from './auth';

/** Padrão: busca filtra a lista fixa pelo termo; recentes fixos. */
export const handlersAlimentos = [
  http.get(url('/foods'), ({ request }) => {
    const q = (new URL(request.url).searchParams.get('q') ?? '').toLowerCase();
    return HttpResponse.json({ data: alimentosApi.filter((a) => a.name.toLowerCase().includes(q)) });
  }),
  http.get(url('/foods/recent'), () => HttpResponse.json({ data: recentesApi })),
];
