import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { RedefinirTela } from './RedefinirTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

async function salvar(senha = 'novaSenha9') {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText('Nova senha'), senha);
  await usuario.type(screen.getByLabelText('Confirme a nova senha'), senha);
  await usuario.click(screen.getByRole('button', { name: 'Salvar senha' }));
}

describe('Redefinir senha', () => {
  it('sem token na URL mostra o link inválido com atalho para pedir outro', () => {
    definirUrl('/senha/redefinir');

    renderizar(<RedefinirTela />);

    expect(screen.getByText('Esse link expirou. Peça outro.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedir outro link' })).toHaveAttribute('href', '/senha/esqueci');
  });

  it('salva, avisa e leva ao login com o e-mail preenchido', async () => {
    let corpo: unknown;
    server.use(
      http.post(url('/password/reset'), async ({ request }) => {
        corpo = await request.json();
        return HttpResponse.json({ message: 'Senha redefinida.' });
      }),
    );
    definirUrl('/senha/redefinir?token=abc123&email=camila%2Btreino%40gmail.com');

    renderizar(<RedefinirTela />);
    await salvar();

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/entrar?email=camila%2Btreino%40gmail.com'));
    expect(await screen.findByText('Senha nova salva. Entre com ela.')).toBeInTheDocument();
    expect(corpo).toEqual({
      token: 'abc123',
      email: 'camila+treino@gmail.com',
      password: 'novaSenha9',
      password_confirmation: 'novaSenha9',
    });
  });

  it('link vencido ou usado vira o estado de link inválido (CA06)', async () => {
    server.use(http.post(url('/password/reset'), () => erroDaApi(422, 'INVALID_RESET_TOKEN', 'Esse link expirou. Peça outro.')));
    definirUrl('/senha/redefinir?token=velho&email=camila%40exemplo.com');

    renderizar(<RedefinirTela />);
    await salvar();

    expect(await screen.findByRole('link', { name: 'Pedir outro link' })).toBeInTheDocument();
    expect(roteador.replace).not.toHaveBeenCalled();
  });
});
