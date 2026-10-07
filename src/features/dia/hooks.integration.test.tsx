import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { Toaster } from '@/components/ui/Toaster';
import { camelizar } from '@/lib/api/case';
import { CHAVES } from '@/lib/chaves';
import { diaApi } from '@/mocks/fixtures/dia';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { novoClienteDeTeste } from '@/test/renderizar';
import { useBuscaAlimentos, usePedirPlano, useRegistrar } from './hooks';
import type { Dia } from './tipos';

function comCliente() {
  const cliente = novoClienteDeTeste();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={cliente}>
      <Toaster>{children}</Toaster>
    </QueryClientProvider>
  );
  return { cliente, wrapper };
}

describe('usePedirPlano', () => {
  it('usa o plano que já está gerando quando a API responde 409', async () => {
    server.use(
      http.post(url('/plans'), () =>
        HttpResponse.json({ message: 'x', code: 'PLAN_ALREADY_GENERATING', details: { plan_id: 77 } }, { status: 409 }),
      ),
    );
    const { wrapper } = comCliente();
    const { result } = renderHook(() => usePedirPlano(), { wrapper });

    let id = 0;
    await act(async () => {
      id = await result.current.mutateAsync();
    });

    expect(id).toBe(77);
  });
});

describe('useRegistrar (RF32, otimista)', () => {
  it('"+" muda na hora e fica com a resposta do servidor', async () => {
    const { cliente, wrapper } = comCliente();
    cliente.setQueryData(CHAVES.dia('today'), camelizar<Dia>(diaApi()));
    server.use(http.post(url('/days/2026-09-28/meals/almoco/entries'), async () => {
      await delay(50);
      return HttpResponse.json({ data: diaApi({ feitas: ['almoco'] }) }, { status: 201 });
    }));
    const { result } = renderHook(() => useRegistrar('today'), { wrapper });

    act(() => result.current.mutate({ slot: 'almoco', entries: [{ suggestionItemId: 5020 }] }));
    await waitFor(() => expect(cliente.getQueryData<Dia>(CHAVES.dia('today'))!.meals[2].items[0].registered).toBe(true));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cliente.getQueryData<Dia>(CHAVES.dia('today'))!.meals[2].entries).toHaveLength(4);
  });

  it('erro no "+" desfaz o otimismo e avisa (Review Focus 2)', async () => {
    const { cliente, wrapper } = comCliente();
    cliente.setQueryData(CHAVES.dia('today'), camelizar<Dia>(diaApi()));
    server.use(http.post(url('/days/2026-09-28/meals/almoco/entries'), () => HttpResponse.error()));
    const { result } = renderHook(() => useRegistrar('today'), { wrapper });

    act(() => result.current.mutate({ slot: 'almoco', entries: [{ suggestionItemId: 5020 }] }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(cliente.getQueryData<Dia>(CHAVES.dia('today'))!.meals[2].items[0].registered).toBe(false);
    expect(await screen.findByText('Não foi possível salvar. Tente de novo.')).toBeInTheDocument();
  });
});

describe('useBuscaAlimentos (Review Focus 5)', () => {
  it('espera 250 ms e só busca o último termo', async () => {
    const pedidos: string[] = [];
    server.use(http.get(url('/foods'), ({ request }) => {
      pedidos.push(new URL(request.url).searchParams.get('q')!);
      return HttpResponse.json({ data: [] });
    }));
    const { wrapper } = comCliente();
    const { rerender } = renderHook(({ t }) => useBuscaAlimentos(t), { initialProps: { t: 'le' }, wrapper });
    rerender({ t: 'lei' });
    rerender({ t: 'leite' });
    await waitFor(() => expect(pedidos).toEqual(['leite']));
  });
});
