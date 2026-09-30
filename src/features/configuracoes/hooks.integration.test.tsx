import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { Toaster } from '@/components/ui/Toaster';
import { CHAVE_ME } from '@/features/auth/hooks';
import { CHAVES } from '@/lib/chaves';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { novoClienteDeTeste } from '@/test/renderizar';
import { useConfiguracoes, useSalvarConfiguracoes } from './hooks';
import type { Configuracoes } from './tipos';

function comCliente() {
  const cliente = novoClienteDeTeste();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={cliente}>
      <Toaster>{children}</Toaster>
    </QueryClientProvider>
  );
  return { cliente, wrapper };
}

describe('hooks de Configurações', () => {
  it('muda na hora e volta se o PUT falhar', async () => {
    server.use(
      http.put(url('/settings'), async () => {
        await delay(80);
        return HttpResponse.json({ message: 'x', code: 'SERVER_ERROR' }, { status: 500 });
      }),
    );
    const { cliente, wrapper } = comCliente();
    const { result } = renderHook(() => ({ dados: useConfiguracoes(), salvar: useSalvarConfiguracoes() }), { wrapper });
    await waitFor(() => expect(result.current.dados.data).toBeDefined());

    act(() => result.current.salvar.mutate({ notifications: { tips: true } }));
    await waitFor(() => expect(cliente.getQueryData<Configuracoes>(CHAVES.configuracoes)!.notifications.tips).toBe(true));
    await waitFor(() => expect(result.current.salvar.isError).toBe(true));
    expect(cliente.getQueryData<Configuracoes>(CHAVES.configuracoes)!.notifications.tips).toBe(false);
  });

  it('trocar a unidade também muda o ["me"] (para as telas do 07C)', async () => {
    const { cliente, wrapper } = comCliente();
    cliente.setQueryData(CHAVE_ME, { id: 1, name: 'Camila', settings: { unitSystem: 'metric' } });
    const { result } = renderHook(() => useSalvarConfiguracoes(), { wrapper });

    await act(() => result.current.mutateAsync({ unitSystem: 'imperial' }));

    expect(cliente.getQueryData<{ settings: { unitSystem: string } }>(CHAVE_ME)!.settings.unitSystem).toBe('imperial');
  });
});
