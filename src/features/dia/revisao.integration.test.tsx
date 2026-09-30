import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { diaApi } from '@/mocks/fixtures/dia';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { DetalheTela } from './components/DetalheTela';
import { DietaTela } from './components/DietaTela';
import { destinoSeguro, GerandoTela } from './components/GerandoTela';
import { HojeTela } from './components/HojeTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

/** Revisão final do 04B: cada teste reproduz um achado. */
beforeEach(() => redefinirNavegacao());

const semPlano = (status: string | null) =>
  http.get(url('/days/today'), () =>
    HttpResponse.json({ message: 'x', code: 'NO_ACTIVE_PLAN', details: { plan_status: status, plan_id: 43 } }, { status: 409 }),
  );

describe('revisão final do 04B', () => {
  it('1: marcar fica bloqueado enquanto o servidor não responde (sem corrida)', async () => {
    let liberar!: () => void;
    const pausa = new Promise<void>((r) => (liberar = r));
    server.use(
      http.patch(url('/days/2026-09-28/meals/almoco'), async () => {
        await pausa;
        return HttpResponse.json({ data: diaApi({ feitas: ['almoco'] }) });
      }),
    );

    renderizar(<DetalheTela slot="almoco" />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Marcar como feita' }));

    expect(await screen.findByRole('button', { name: 'Desmarcar refeição' })).toBeDisabled();
    liberar();
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Desmarcar refeição' })).toBeEnabled());
  });

  it('2: "Tentar de novo" na Dieta pede um plano novo', async () => {
    server.use(
      semPlano('failed'),
      http.post(url('/plans'), () => HttpResponse.json({ data: { id: 44, status: 'pending' } }, { status: 202 })),
    );

    renderizar(<DietaTela />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    await vi.waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/gerando?plano=44&voltar=%2Fdieta'));
  });

  it('2: sem nenhum plano, o Detalhe mostra a falha (não "quase pronto")', async () => {
    server.use(semPlano(null));

    renderizar(<DetalheTela slot="almoco" />);

    expect(await screen.findByRole('heading', { name: 'Não conseguimos montar seu plano' })).toBeInTheDocument();
  });

  it.each(['/\\evil.com', '/\tevil.com', '/\\/evil.com'])('3: voltar %j não sai do app', (voltar) => {
    expect(destinoSeguro(voltar)).toBeNull();
  });

  it('4: "Tentar de novo" no Gerando mostra o erro da API', async () => {
    definirUrl('/onboarding/gerando?plano=42');
    server.use(
      http.get(url('/plans/42'), () => HttpResponse.json({ data: { id: 42, status: 'failed', is_active: false } })),
      http.post(url('/plans'), () =>
        HttpResponse.json({ message: 'Você já refez o plano 5 vezes hoje. Tente amanhã.', code: 'TOO_MANY_REQUESTS' }, { status: 429 }),
      ),
    );

    renderizar(<GerandoTela />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Você já refez o plano 5 vezes hoje. Tente amanhã.')).toBeInTheDocument();
  });

  it('4: "Tentar de novo" no Hoje mostra o erro da API', async () => {
    server.use(semPlano('failed'), http.post(url('/plans'), () => HttpResponse.error()));

    renderizar(<HojeTela />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Sem conexão. Confira a internet e tente de novo.')).toBeInTheDocument();
  });

  it('5: erro ao carregar o dia no Detalhe mostra a mensagem com "Tentar de novo"', async () => {
    server.use(http.get(url('/days/today'), () => erroDaApi(500, 'SERVER_ERROR', 'x')));

    renderizar(<DetalheTela slot="almoco" />);

    expect(await screen.findByText('Não foi possível carregar sua refeição', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });

  it('6: marcar vai para a data carregada; se o dia virou, avisa e recarrega hoje', async () => {
    let caminho = '';
    server.use(
      http.patch(url('/days/:data/meals/:slot'), ({ request }) => {
        caminho = new URL(request.url).pathname;
        return erroDaApi(409, 'DAY_NOT_EDITABLE', 'Só dá para mudar o dia de hoje.');
      }),
    );

    renderizar(<HojeTela />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Marcar café da manhã como feita' }));

    expect(await screen.findByText('O dia virou. Atualizamos para hoje.')).toBeInTheDocument();
    expect(caminho).toBe('/api/v1/days/2026-09-28/meals/cafe');
  });
});
