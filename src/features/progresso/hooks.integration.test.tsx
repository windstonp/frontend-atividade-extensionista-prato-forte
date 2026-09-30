import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CHAVES } from '@/lib/chaves';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { novoClienteDeTeste } from '@/test/renderizar';
import { usePeriodo, useProgresso, useRegistrarPeso } from './hooks';

function comCliente(cliente = novoClienteDeTeste()) {
  return { cliente, wrapper: ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={cliente}>{children}</QueryClientProvider> };
}

afterEach(() => {
  vi.restoreAllMocks();
  try {
    localStorage.clear();
  } catch {
    /* sem storage */
  }
});

describe('hooks da Evolução', () => {
  it('useProgresso pede o período e devolve em camelCase', async () => {
    let pedido = '';
    server.use(
      http.get(url('/progress'), ({ request }) => {
        pedido = new URL(request.url).searchParams.get('period') ?? '';
        return HttpResponse.json({ data: { period: '3m', weight: { start_kg: 1, current_kg: 2, goal_kg: null, goal_source: null, change_kg: 1, span_weeks: 1, points: [], forecast: null }, adherence: { days: [], complete_days: 0, streak: 0 }, averages: { days_counted: 0, protein: { avg_g: null, target_g: 115 }, calories: { avg_kcal: null, target_kcal: 2250 }, insight: null } } });
      }),
    );
    const { wrapper } = comCliente();
    const { result } = renderHook(() => useProgresso('3m'), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(pedido).toBe('3m');
    expect(result.current.data!.averages.protein.targetG).toBe(115);
  });

  it('registrar peso: progresso e onboarding saem do cache (nada velho na volta), pesagens e perfil são invalidados', async () => {
    server.use(http.post(url('/weigh-ins'), () => HttpResponse.json({ data: { id: 9, date: '2026-09-30', weight_kg: 58.6 }, meta: { replaced: false } }, { status: 201 })));
    const { cliente, wrapper } = comCliente();
    cliente.setQueryData(CHAVES.progresso('6w'), { velho: true });
    cliente.setQueryData(CHAVES.onboarding, { answers: { weightKg: 58.4 } });
    const invalidar = vi.spyOn(cliente, 'invalidateQueries');
    const { result } = renderHook(() => useRegistrarPeso(), { wrapper });

    await act(() => result.current.mutateAsync(58.6));

    expect(cliente.getQueryData(CHAVES.progresso('6w'))).toBeUndefined();
    expect(cliente.getQueryData(CHAVES.onboarding)).toBeUndefined();
    const chaves = invalidar.mock.calls.map(([filtro]) => JSON.stringify(filtro?.queryKey));
    expect(chaves).toEqual(expect.arrayContaining([JSON.stringify(CHAVES.pesagens), JSON.stringify(CHAVES.perfil)]));
  });

  it('usePeriodo lembra a escolha e começa em 6w', () => {
    const { result, unmount } = renderHook(() => usePeriodo());
    expect(result.current[0]).toBe('6w');
    act(() => result.current[1]('all'));
    expect(result.current[0]).toBe('all');
    unmount();

    expect(renderHook(() => usePeriodo()).result.current[0]).toBe('all');
  });

  it('usePeriodo sem localStorage (aba anônima) não quebra', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const { result } = renderHook(() => usePeriodo());

    expect(result.current[0]).toBe('6w');
    act(() => result.current[1]('3m'));
    expect(result.current[0]).toBe('3m');
  });
});
