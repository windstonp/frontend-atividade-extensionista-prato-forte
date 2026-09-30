import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { Toaster } from '@/components/ui/Toaster';
import { conversaApi } from '@/mocks/fixtures/nutri';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { novoClienteDeTeste } from '@/test/renderizar';
import { useApagarConversa, useConversas, useNovaConversa } from './hooks';

function comCliente() {
  const cliente = novoClienteDeTeste();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={cliente}>
      <Toaster>{children}</Toaster>
    </QueryClientProvider>
  );
  return { wrapper };
}

describe('hooks do Nutri', () => {
  it('lista as conversas e segue o cursor', async () => {
    server.use(
      http.get(url('/conversations'), ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        return HttpResponse.json(
          cursor
            ? { data: [conversaApi(1)], meta: { next_cursor: null, per_page: 15 } }
            : { data: [conversaApi(3), conversaApi(2)], meta: { next_cursor: 'abc', per_page: 15 } },
        );
      }),
    );
    const { result } = renderHook(() => useConversas(), comCliente());

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.data!.pages.flatMap((p) => p.data).map((c) => c.id)).toEqual([3, 2, 1]));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('nova conversa devolve o id (201 ou 200)', async () => {
    server.use(http.post(url('/conversations'), () => HttpResponse.json({ data: conversaApi(9, { vazia: true }) }, { status: 200 })));
    const { result } = renderHook(() => useNovaConversa(), comCliente());

    let id = 0;
    await act(async () => {
      id = (await result.current.mutateAsync()).id;
    });

    expect(id).toBe(9);
  });

  it('apagar tira da lista na hora e volta se falhar', async () => {
    server.use(
      http.get(url('/conversations'), () => HttpResponse.json({ data: [conversaApi(3), conversaApi(2)], meta: { next_cursor: null, per_page: 15 } })),
      http.delete(url('/conversations/3'), async () => {
        await delay(100);
        return HttpResponse.error();
      }),
    );
    const { wrapper } = comCliente();
    const { result } = renderHook(() => ({ lista: useConversas(), apagar: useApagarConversa() }), { wrapper });
    await waitFor(() => expect(result.current.lista.data).toBeDefined());

    act(() => result.current.apagar.mutate(3));
    await waitFor(() => expect(result.current.lista.data!.pages[0].data.map((c) => c.id)).toEqual([2]));
    await waitFor(() => expect(result.current.apagar.isError).toBe(true));
    await waitFor(() => expect(result.current.lista.data!.pages[0].data.map((c) => c.id)).toEqual([3, 2]));
  });
});
