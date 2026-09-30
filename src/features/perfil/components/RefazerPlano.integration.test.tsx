import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { RefazerPlano } from './RefazerPlano';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

describe('Refazer meu plano (RF18)', () => {
  it('confirma e abre o Gerando voltando ao Perfil', async () => {
    server.use(http.post(url('/plans'), () => HttpResponse.json({ data: { id: 60, status: 'pending' } }, { status: 202 })));
    const usuario = userEvent.setup();

    renderizar(<RefazerPlano />);
    await usuario.click(screen.getByRole('button', { name: 'Refazer meu plano' }));

    expect(
      await screen.findByText('Vamos montar um plano novo com suas respostas atuais. As refeições que você já marcou hoje ficam.'),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Refazer' }));

    await vi.waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/gerando?plano=60&voltar=%2Fperfil'));
  });

  it('limite do dia mostra a mensagem da API', async () => {
    server.use(
      http.post(url('/plans'), () =>
        HttpResponse.json({ message: 'Você já refez o plano 5 vezes hoje. Tente amanhã.', code: 'TOO_MANY_REQUESTS' }, { status: 429 }),
      ),
    );
    const usuario = userEvent.setup();

    renderizar(<RefazerPlano />);
    await usuario.click(screen.getByRole('button', { name: 'Refazer meu plano' }));
    await usuario.click(await screen.findByRole('button', { name: 'Refazer' }));

    expect(await screen.findByText('Você já refez o plano 5 vezes hoje. Tente amanhã.')).toBeInTheDocument();
    expect(roteador.push).not.toHaveBeenCalled();
  });
});
