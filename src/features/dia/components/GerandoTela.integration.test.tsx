import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { planoProntoApi } from '@/mocks/fixtures/dia';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { destinoSeguro, GerandoTela } from './GerandoTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

/** Respostas de GET /plans/42, em ordem; a última se repete. */
function statusDoPlano(...status: ('pending' | 'generating' | 'ready' | 'failed')[]) {
  let i = 0;
  server.use(
    http.get(url('/plans/42'), () => {
      const s = status[Math.min(i++, status.length - 1)];
      return HttpResponse.json({ data: s === 'ready' ? planoProntoApi(42) : { id: 42, status: s, is_active: false, ...(s === 'failed' ? { failure_reason: 'AI_UNAVAILABLE' } : {}) } });
    }),
  );
}

beforeEach(() => {
  redefinirNavegacao();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => vi.useRealTimers());

describe('Gerando (S09)', () => {
  it('consulta a cada 1,5 s até ficar pronto e vai para o Pronto', async () => {
    definirUrl('/onboarding/gerando?plano=42');
    statusDoPlano('pending', 'generating', 'ready');

    renderizar(<GerandoTela />);
    expect(await screen.findByRole('heading', { name: 'Montando seu plano' })).toBeInTheDocument();
    expect(screen.getByText('Costuma levar uns 10 segundos.')).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(3500));

    await vi.waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/onboarding/pronto?plano=42'));
  });

  it('com voltar, volta para a tela de origem avisando', async () => {
    definirUrl('/onboarding/gerando?plano=42&voltar=%2Fperfil');
    statusDoPlano('ready');

    renderizar(<GerandoTela />);
    await act(() => vi.advanceTimersByTimeAsync(1000));

    await vi.waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/perfil'));
    expect(await screen.findByText('Seu plano novo está pronto.')).toBeInTheDocument();
  });

  it('falhou: "Tentar de novo" pede outro plano e troca o id na URL (E2E-07)', async () => {
    definirUrl('/onboarding/gerando?plano=42&voltar=%2Fperfil');
    statusDoPlano('failed');
    server.use(http.post(url('/plans'), () => HttpResponse.json({ data: { id: 43, status: 'pending' } }, { status: 202 })));

    renderizar(<GerandoTela />);
    expect(await screen.findByRole('heading', { name: 'Não deu para montar agora' })).toBeInTheDocument();
    expect(screen.getByText('Seus dados estão salvos. Foi a conexão com o Nutri que falhou no meio do caminho.')).toBeInTheDocument();
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(screen.getByRole('button', { name: 'Tentar de novo' }));

    await vi.waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/onboarding/gerando?plano=43&voltar=%2Fperfil'));
  });

  it('sem plano na URL, vai para o Hoje', async () => {
    definirUrl('/onboarding/gerando');
    renderizar(<GerandoTela />);
    await vi.waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/hoje'));
  });

  it.each([
    ['/perfil', '/perfil'],
    ['//evil.example', null],
    ['https://evil.example', null],
    [null, null],
  ])('voltar %s → %s', (voltar, esperado) => {
    expect(destinoSeguro(voltar)).toBe(esperado);
  });
});
