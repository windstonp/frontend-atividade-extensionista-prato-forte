import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recarregarEm } from '@/lib/navegar';
import { usuarioApi } from '@/mocks/fixtures/usuario';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { ContaSection } from './ContaSection';

vi.mock('next/navigation', () => import('@/test/next-navigation'));
vi.mock('@/lib/navegar', () => ({ recarregarEm: vi.fn() }));

beforeEach(() => {
  redefinirNavegacao();
  vi.mocked(recarregarEm).mockReset();
  server.use(http.get(url('/me'), () => HttpResponse.json({ data: usuarioApi })));
});

describe('Sua conta', () => {
  it('mostra o e-mail e leva para trocar a senha', async () => {
    renderizar(<ContaSection />);

    expect(await screen.findByText('camila.reus@gmail.com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Trocar senha/ })).toHaveAttribute('href', '/perfil/configuracoes/senha');
  });

  it('sair encerra a sessão e recarrega nas Boas-vindas (RF03)', async () => {
    let saiu = false;
    server.use(
      http.post(url('/logout'), () => {
        saiu = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderizar(<ContaSection />);
    await userEvent.setup().click(await screen.findByRole('button', { name: /Sair desta conta/ }));

    await waitFor(() => expect(recarregarEm).toHaveBeenCalledWith('/'));
    expect(saiu).toBe(true);
  });

  it('apagar com a senha certa manda a senha e recarrega avisando (RF06)', async () => {
    let corpo: unknown;
    server.use(
      http.delete(url('/me'), async ({ request }) => {
        corpo = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const usuario = userEvent.setup();

    renderizar(<ContaSection />);
    await usuario.click(await screen.findByRole('button', { name: 'Apagar minha conta e meus dados' }));
    const folha = await screen.findByRole('dialog', { name: 'Apagar sua conta?' });
    await usuario.type(within(folha).getByLabelText('Sua senha'), 'senha1234');
    await usuario.click(within(folha).getByRole('button', { name: 'Apagar tudo' }));

    await waitFor(() => expect(recarregarEm).toHaveBeenCalledWith('/?conta=apagada'));
    expect(corpo).toEqual({ password: 'senha1234' });
  });

  it('senha errada fica na folha, sem apagar', async () => {
    server.use(
      http.delete(url('/me'), () =>
        erroDaApi(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', { errors: { password: ['A senha não confere.'] } }),
      ),
    );
    const usuario = userEvent.setup();

    renderizar(<ContaSection />);
    await usuario.click(await screen.findByRole('button', { name: 'Apagar minha conta e meus dados' }));
    const folha = await screen.findByRole('dialog', { name: 'Apagar sua conta?' });
    await usuario.type(within(folha).getByLabelText('Sua senha'), 'errada123');
    await usuario.click(within(folha).getByRole('button', { name: 'Apagar tudo' }));

    expect(await within(folha).findByText('A senha não confere.')).toBeInTheDocument();
    expect(recarregarEm).not.toHaveBeenCalled();
  });
});
