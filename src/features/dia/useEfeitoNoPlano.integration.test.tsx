import { act, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/components/ui/Toaster';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao, roteador } from '@/test/next-navigation';
import { novoClienteDeTeste } from '@/test/renderizar';
import { useEfeitoNoPlano } from './useEfeitoNoPlano';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

function montar() {
  const cliente = novoClienteDeTeste();
  const invalidar = vi.spyOn(cliente, 'invalidateQueries');
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={cliente}>
      <Toaster>{children}</Toaster>
    </QueryClientProvider>
  );
  return { invalidar, ...renderHook(() => useEfeitoNoPlano(), { wrapper }) };
}

beforeEach(() => redefinirNavegacao());

describe('useEfeitoNoPlano (RN21)', () => {
  it('regeneration_started abre o Gerando com volta ao Perfil', () => {
    const { result, invalidar } = montar();
    act(() => result.current({ planEffect: 'regeneration_started', planId: 51 }));
    expect(roteador.push).toHaveBeenCalledWith('/onboarding/gerando?plano=51&voltar=%2Fperfil');
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['dia'] });
  });

  it('regeneration_suggested volta ao Perfil e oferece "Refazer"', async () => {
    server.use(http.post(url('/plans'), () => HttpResponse.json({ data: { id: 52, status: 'pending' } }, { status: 202 })));
    const { result } = montar();

    act(() => result.current({ planEffect: 'regeneration_suggested', planId: null }));

    expect(roteador.push).toHaveBeenCalledWith('/perfil');
    expect(screen.getByText('Salvo. Quer refazer seu plano com isso?')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Refazer' }));
    await vi.waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/gerando?plano=52&voltar=%2Fperfil'));
  });

  it.each([
    ['times_updated', 'Horários das refeições atualizados'],
    ['none', 'Salvo.'],
  ] as const)('%s avisa "%s" e volta ao Perfil', (efeito, texto) => {
    const { result } = montar();
    act(() => result.current({ planEffect: efeito, planId: null }));
    expect(screen.getByText(texto)).toBeInTheDocument();
    expect(roteador.push).toHaveBeenCalledWith('/perfil');
  });
});
