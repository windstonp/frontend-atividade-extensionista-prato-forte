import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { planoProntoApi } from '@/mocks/fixtures/dia';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { ProntoTela } from './ProntoTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

describe('Pronto (S10)', () => {
  it('mostra o dia comum vindo do plano', async () => {
    definirUrl('/onboarding/pronto?plano=42');
    server.use(http.get(url('/plans/42'), () => HttpResponse.json({ data: planoProntoApi(42) })));

    renderizar(<ProntoTela />);

    expect(await screen.findByText('Um dia comum')).toBeInTheDocument();
    expect(screen.getByText('Café da manhã')).toBeInTheDocument();
    expect(screen.getByText('Jantar')).toBeInTheDocument();
    expect(screen.getByText('2.250 kcal')).toBeInTheDocument();
    expect(screen.getByText('115 g')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver o dia de hoje' })).toHaveAttribute('href', '/hoje');
  });

  it('plano que ainda não está pronto volta para o Gerando', async () => {
    definirUrl('/onboarding/pronto?plano=42');
    server.use(http.get(url('/plans/42'), () => HttpResponse.json({ data: { id: 42, status: 'generating', is_active: false } })));

    renderizar(<ProntoTela />);

    await vi.waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/onboarding/gerando?plano=42'));
  });
});
