import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { usuarioApi } from '@/mocks/fixtures/usuario';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { novoClienteDeTeste } from '@/test/renderizar';
import { useMedidas } from './useMedidas';

const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={novoClienteDeTeste()}>{children}</QueryClientProvider>;

describe('useMedidas', () => {
  it('segue o settings.unit_system do /me', async () => {
    server.use(http.get(url('/me'), () => HttpResponse.json({ data: { ...usuarioApi, settings: { unit_system: 'imperial' } } })));
    const { result } = renderHook(() => useMedidas(), { wrapper });

    await waitFor(() => expect(result.current.sistema).toBe('imperial'));
  });

  it('sem sessão (401): métrico', async () => {
    const { result } = renderHook(() => useMedidas(), { wrapper });

    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.sistema).toBe('metric');
  });
});
