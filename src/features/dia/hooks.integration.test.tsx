import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { Toaster } from '@/components/ui/Toaster';
import { diaApi } from '@/mocks/fixtures/dia';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { novoClienteDeTeste } from '@/test/renderizar';
import { useDia, useMarcarRefeicao, usePedirPlano } from './hooks';

function comCliente() {
  const cliente = novoClienteDeTeste();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={cliente}>
      <Toaster>{children}</Toaster>
    </QueryClientProvider>
  );
  return { cliente, wrapper };
}

describe('useMarcarRefeicao (RF13, otimista)', () => {
  it('muda na hora e fica com a resposta do servidor', async () => {
    let liberar!: () => void;
    const pausa = new Promise<void>((r) => (liberar = r));
    server.use(
      http.patch(url('/days/today/meals/cafe'), async () => {
        await pausa;
        return HttpResponse.json({ data: diaApi({ feitas: ['cafe'] }) });
      }),
    );
    const { wrapper } = comCliente();
    const { result } = renderHook(() => ({ dia: useDia(), marcar: useMarcarRefeicao() }), { wrapper });
    await waitFor(() => expect(result.current.dia.data).toBeDefined());

    act(() => result.current.marcar.mutate({ slot: 'cafe', done: true }));

    await waitFor(() => expect(result.current.dia.data!.meals[0].done).toBe(true)); // antes do servidor responder
    liberar();
    await waitFor(() => expect(result.current.marcar.isSuccess).toBe(true));
    expect(result.current.dia.data!.meals[0].done).toBe(true);
  });

  it('volta ao estado anterior e avisa quando a API falha', async () => {
    server.use(http.patch(url('/days/today/meals/cafe'), () => HttpResponse.error()));
    const { wrapper } = comCliente();
    const { result } = renderHook(() => ({ dia: useDia(), marcar: useMarcarRefeicao() }), { wrapper });
    await waitFor(() => expect(result.current.dia.data).toBeDefined());

    act(() => result.current.marcar.mutate({ slot: 'cafe', done: true }));

    await waitFor(() => expect(result.current.marcar.isError).toBe(true));
    expect(result.current.dia.data!.meals[0].done).toBe(false);
  });
});

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
