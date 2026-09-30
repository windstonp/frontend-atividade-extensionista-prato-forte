import { act, renderHook, waitFor } from '@testing-library/react';
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

describe('questionário', () => {
  it('"Agora não" some com o convite na hora', async () => {
    server.use(http.get(url('/usability-responses/status'), () => HttpResponse.json({ data: { round: '2026-1', responded: false, invite: true } })));
    const { cliente, wrapper } = comCliente();
    const { result } = renderHook(() => ({ status: useStatusUsabilidade(), dispensar: useDispensarConvite() }), { wrapper });
    await waitFor(() => expect(result.current.status.data?.invite).toBe(true));

    act(() => result.current.dispensar.mutate());

    expect(cliente.getQueryData<StatusUsabilidade>(CHAVES.usabilidade)?.invite).toBe(false);
  });
});
