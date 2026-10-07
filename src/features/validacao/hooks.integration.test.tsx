import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { Toaster } from '@/components/ui/Toaster';
import { CHAVES } from '@/lib/chaves';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { novoClienteDeTeste } from '@/test/renderizar';
import { useAvaliacao, useDispensarConvite, useStatusUsabilidade } from './hooks';
import type { StatusUsabilidade } from './tipos';

function comCliente() {
  const cliente = novoClienteDeTeste();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={cliente}>
      <Toaster>{children}</Toaster>
    </QueryClientProvider>
  );
  return { cliente, wrapper };
}

const alvo = { tipo: 'nutri_message' as const, id: 12 };

describe('useAvaliacao', () => {
  it('marca na hora, manda o PUT e tocar de novo remove (DELETE)', async () => {
    const pedidos: string[] = [];
    server.use(
      http.put(url('/ratings'), async ({ request }) => {
        pedidos.push(`PUT ${JSON.stringify(await request.json())}`);
        return HttpResponse.json({ data: {} });
      }),
      http.delete(url('/ratings'), () => {
        pedidos.push('DELETE');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderHook(() => useAvaliacao(alvo, null), comCliente());

    act(() => result.current.marcar('up'));
    expect(result.current.valor).toEqual({ value: 'up', comment: null });
    await waitFor(() => expect(result.current.salvando).toBe(false));
    act(() => result.current.marcar('up'));
    await waitFor(() => expect(result.current.valor).toBeNull());
    await waitFor(() => expect(pedidos).toEqual(['PUT {"rateable_type":"nutri_message","rateable_id":12,"value":"up","comment":null}', 'DELETE']));
  });

  it('comentário vai junto do 👎', async () => {
    let corpo: unknown;
    server.use(http.put(url('/ratings'), async ({ request }) => ((corpo = await request.json()), HttpResponse.json({ data: {} }))));
    const { result } = renderHook(() => useAvaliacao(alvo, { value: 'down', comment: null }), comCliente());

    act(() => result.current.comentar('Não tenho batata-doce em casa.'));

    await waitFor(() => expect(corpo).toEqual({ rateable_type: 'nutri_message', rateable_id: 12, value: 'down', comment: 'Não tenho batata-doce em casa.' }));
  });

  it('erro: volta ao que era', async () => {
    server.use(http.put(url('/ratings'), async () => (await delay(50), HttpResponse.json({ message: 'x', code: 'SERVER_ERROR' }, { status: 500 }))));
    const { result } = renderHook(() => useAvaliacao(alvo, { value: 'down', comment: null }), comCliente());

    act(() => result.current.marcar('up'));
    expect(result.current.valor?.value).toBe('up');
    await waitFor(() => expect(result.current.valor?.value).toBe('down'));
  });
});

describe('useAvaliacao — toques rápidos e cache', () => {
  it('👍 falha e 👎 dá certo (dois toques antes da resposta): fica 👎, como no servidor', async () => {
    let pedidos = 0;
    server.use(
      http.put(url('/ratings'), async ({ request }) => {
        pedidos++;
        const { value } = (await request.json()) as { value: string };
        await delay(40);
        return value === 'up' ? HttpResponse.json({ message: 'x', code: 'SERVER_ERROR' }, { status: 500 }) : HttpResponse.json({ data: {} });
      }),
    );
    const { result } = renderHook(() => useAvaliacao(alvo, null), comCliente());

    act(() => result.current.marcar('up'));
    act(() => result.current.marcar('down'));
    expect(result.current.salvando).toBe(true);

    await waitFor(() => expect(pedidos).toBe(2));
    await waitFor(() => expect(result.current.salvando).toBe(false));
    expect(result.current.valor?.value).toBe('down');
  });

  it('sem rede, 👍 e 👍 de novo: os dois falham e volta ao que o servidor tinha', async () => {
    server.use(http.put(url('/ratings'), () => HttpResponse.error()), http.delete(url('/ratings'), () => HttpResponse.error()));
    const { result } = renderHook(() => useAvaliacao(alvo, null), comCliente());

    act(() => result.current.marcar('up'));
    act(() => result.current.marcar('up'));

    await waitFor(() => expect(result.current.salvando).toBe(false));
    expect(result.current.valor).toBeNull();
  });

  it('salva no cache da conversa e do plano (voltar à tela mostra marcado)', async () => {
    const { cliente, wrapper } = comCliente();
    cliente.setQueryData(CHAVES.mensagens(5), { pages: [{ data: [{ id: 12, role: 'assistant', rating: null }], meta: {} }], pageParams: [null] });
    cliente.setQueryData(CHAVES.plano(42), { id: 42, rating: null });
    const { result } = renderHook(() => ({ msg: useAvaliacao(alvo, null), plano: useAvaliacao({ tipo: 'meal_plan', id: 42 }, null) }), { wrapper });

    act(() => result.current.msg.marcar('up'));
    act(() => result.current.plano.marcar('down'));

    await waitFor(() => expect(result.current.msg.salvando || result.current.plano.salvando).toBe(false));
    const pagina = cliente.getQueryData<{ pages: { data: { rating: unknown }[] }[] }>(CHAVES.mensagens(5))!;
    expect(pagina.pages[0].data[0].rating).toEqual({ value: 'up', comment: null });
    expect(cliente.getQueryData<{ rating: unknown }>(CHAVES.plano(42))!.rating).toEqual({ value: 'down', comment: null });
  });
});

describe('questionário', () => {
  it('"Agora não" some com o convite na hora', async () => {
    server.use(http.get(url('/usability-responses/status'), () => HttpResponse.json({ data: { round: '2026-1', responded: false, invite: true } })));
    const { cliente, wrapper } = comCliente();
    const { result } = renderHook(() => ({ status: useStatusUsabilidade(), dispensar: useDispensarConvite() }), { wrapper });
    await waitFor(() => expect(result.current.status.data?.invite).toBe(true));

    act(() => result.current.dispensar.mutate());

    expect(cliente.getQueryData<StatusUsabilidade>(CHAVES.usabilidade)?.invite).toBe(false);
  });

  it('"Agora não" que falha devolve o convite e avisa', async () => {
    server.use(
      http.get(url('/usability-responses/status'), () => HttpResponse.json({ data: { round: '2026-1', responded: false, invite: true } })),
      http.post(url('/usability-responses/dismiss'), () => HttpResponse.json({ code: 'SERVER_ERROR', message: 'Algo deu errado do nosso lado. Tente de novo.' }, { status: 500 })),
    );
    const { cliente, wrapper } = comCliente();
    const { result } = renderHook(() => ({ status: useStatusUsabilidade(), dispensar: useDispensarConvite() }), { wrapper });
    await waitFor(() => expect(result.current.status.data?.invite).toBe(true));

    act(() => result.current.dispensar.mutate());

    await waitFor(() => expect(result.current.dispensar.isError).toBe(true));
    expect(cliente.getQueryData<StatusUsabilidade>(CHAVES.usabilidade)?.invite).toBe(true);
    expect(await screen.findByText('Não deu para esconder o convite agora. Tente de novo.')).toBeInTheDocument();
  });
});
