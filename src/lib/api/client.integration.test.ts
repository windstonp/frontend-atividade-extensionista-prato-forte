import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';

// O cookie CSRF é memorizado no módulo: cada teste pega um módulo novo.
let api: typeof import('./client').api;

beforeEach(async () => {
  vi.resetModules();
  ({ api } = await import('./client'));
  document.cookie = 'XSRF-TOKEN=token%3Dteste; path=/';
});

describe('api()', () => {
  it('lê com cookie de sessão e Accept JSON, e devolve chaves em camelCase', async () => {
    let pedido: Request | undefined;
    server.use(
      http.get(url('/me'), ({ request }) => {
        pedido = request;
        return HttpResponse.json({ data: { preferred_name: 'Camila', next_step: 'objetivo' } });
      }),
    );

    const corpo = await api<{ data: { preferredName: string; nextStep: string } }>('/me');

    expect(corpo.data).toEqual({ preferredName: 'Camila', nextStep: 'objetivo' });
    expect(pedido?.headers.get('accept')).toBe('application/json');
    expect(pedido?.credentials).toBe('include');
  });

  it('pede o cookie CSRF uma vez e manda X-XSRF-TOKEN e corpo em snake_case nas escritas', async () => {
    let pedidosCsrf = 0;
    const corpos: unknown[] = [];
    const tokens: (string | null)[] = [];
    server.use(
      http.get(`${API}/sanctum/csrf-cookie`, () => {
        pedidosCsrf++;
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(url('/login'), async ({ request }) => {
        corpos.push(await request.json());
        tokens.push(request.headers.get('x-xsrf-token'));
        return HttpResponse.json({ data: {} });
      }),
    );

    await api('/login', { method: 'POST', body: { email: 'a@b.com', passwordConfirmation: 'x' } });
    await api('/login', { method: 'POST', body: { email: 'a@b.com' } });

    expect(pedidosCsrf).toBe(1);
    expect(corpos[0]).toEqual({ email: 'a@b.com', password_confirmation: 'x' });
    expect(tokens).toEqual(['token=teste', 'token=teste']);
  });

  it('renova o CSRF e repete uma vez quando a escrita volta 403', async () => {
    let pedidosCsrf = 0;
    let tentativas = 0;
    server.use(
      http.get(`${API}/sanctum/csrf-cookie`, () => {
        pedidosCsrf++;
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(url('/logout'), () => {
        tentativas++;
        return tentativas === 1
          ? erroDaApi(403, 'FORBIDDEN', 'Não deu para concluir. Recarregue a página e tente de novo.')
          : new HttpResponse(null, { status: 204 });
      }),
    );

    await expect(api('/logout', { method: 'POST' })).resolves.toBeUndefined();
    expect(tentativas).toBe(2);
    expect(pedidosCsrf).toBe(2);
  });

  it('transforma o erro da API em ApiError com campos em camelCase', async () => {
    server.use(
      http.put(url('/me/password'), () =>
        erroDaApi(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', {
          errors: { current_password: ['A senha atual não confere.'] },
        }),
      ),
    );

    await expect(api('/me/password', { method: 'PUT', body: {} })).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Confira os campos destacados.',
      fieldErrors: { currentPassword: ['A senha atual não confere.'] },
    });
  });

  it('traz os detalhes do erro em camelCase (429)', async () => {
    server.use(
      http.post(url('/login'), () =>
        erroDaApi(429, 'TOO_MANY_REQUESTS', 'Muitas tentativas seguidas. Tente de novo em 40 segundos.', {
          details: { retry_after: 40 },
        }),
      ),
    );

    await expect(api('/login', { method: 'POST', body: {} })).rejects.toMatchObject({
      code: 'TOO_MANY_REQUESTS',
      details: { retryAfter: 40 },
    });
  });

  it('vira NETWORK_ERROR quando não há resposta', async () => {
    server.use(http.get(url('/me'), () => HttpResponse.error()));

    await expect(api('/me')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Sem conexão. Confira a internet e tente de novo.',
    });
  });

  it('usa a mensagem genérica quando o erro não vem em JSON', async () => {
    server.use(http.get(url('/me'), () => new HttpResponse('<h1>502</h1>', { status: 502 })));

    await expect(api('/me')).rejects.toMatchObject({
      status: 502,
      code: 'SERVER_ERROR',
      message: 'Algo deu errado do nosso lado. Tente de novo.',
    });
  });
});
