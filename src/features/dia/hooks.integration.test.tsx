import { act, renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { Toaster } from '@/components/ui/Toaster';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { novoClienteDeTeste } from '@/test/renderizar';
import { usePedirPlano } from './hooks';

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
