import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { TrocarSenhaTela } from './TrocarSenhaTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

async function trocar() {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText('Senha atual'), 'senha1234');
  await usuario.type(screen.getByLabelText('Nova senha'), 'novaSenha9');
  await usuario.type(screen.getByLabelText('Confirme a nova senha'), 'novaSenha9');
  await usuario.click(screen.getByRole('button', { name: 'Salvar' }));
}

describe('Trocar senha', () => {
  it('troca, avisa e volta para Configurações (RF05)', async () => {
    let corpo: unknown;
    server.use(
      http.put(url('/me/password'), async ({ request }) => {
        corpo = await request.json();
        return HttpResponse.json({ message: 'Senha trocada.' });
      }),
    );

    renderizar(<TrocarSenhaTela />);
    await trocar();

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/perfil/configuracoes'));
    expect(await screen.findByText('Senha trocada.')).toBeInTheDocument();
    expect(corpo).toEqual({ current_password: 'senha1234', password: 'novaSenha9', password_confirmation: 'novaSenha9' });
  });

  it('mostra "A senha atual não confere." no campo certo', async () => {
    server.use(
      http.put(url('/me/password'), () =>
        erroDaApi(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', {
          errors: { current_password: ['A senha atual não confere.'] },
        }),
      ),
    );

    renderizar(<TrocarSenhaTela />);
    await trocar();

    expect(await screen.findByText('A senha atual não confere.')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha atual')).toHaveAttribute('aria-invalid', 'true');
    expect(roteador.push).not.toHaveBeenCalled();
  });
});
