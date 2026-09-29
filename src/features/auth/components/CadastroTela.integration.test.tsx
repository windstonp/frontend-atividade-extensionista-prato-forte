import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { comOnboardingEm } from '@/mocks/fixtures/usuario';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { CadastroTela } from './CadastroTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

async function preencherEEnviar() {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText('Nome completo'), 'Camila Réus');
  await usuario.type(screen.getByLabelText('E-mail'), 'camila.reus@gmail.com');
  await usuario.type(screen.getByLabelText('Senha'), 'senha1234');
  await usuario.click(screen.getByRole('checkbox', { name: /Li e aceito/ }));
  await usuario.click(screen.getByRole('button', { name: 'Criar conta' }));
}

describe('Criar conta', () => {
  it('cria a conta e vai para a primeira etapa do onboarding (CA01)', async () => {
    let corpo: unknown;
    server.use(
      http.post(url('/register'), async ({ request }) => {
        corpo = await request.json();
        return HttpResponse.json({ data: comOnboardingEm('objetivo') }, { status: 201 });
      }),
    );

    renderizar(<CadastroTela />);
    await preencherEEnviar();

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/onboarding/objetivo'));
    expect(corpo).toEqual({
      name: 'Camila Réus',
      email: 'camila.reus@gmail.com',
      password: 'senha1234',
      password_confirmation: 'senha1234',
      terms_accepted: true,
      terms_version: '2026-09',
    });
  });

  it('mostra o e-mail já cadastrado no campo, com atalho para entrar (CA02)', async () => {
    server.use(
      http.post(url('/register'), () =>
        erroDaApi(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', { errors: { email: ['Esse e-mail já tem conta.'] } }),
      ),
    );

    renderizar(<CadastroTela />);
    await preencherEEnviar();

    expect(await screen.findByText('Esse e-mail já tem conta.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Entrar com este e-mail' })).toHaveAttribute('href', '/entrar?email=camila.reus%40gmail.com');
    expect(roteador.replace).not.toHaveBeenCalled();
  });

  it('sem rede avisa e deixa tentar de novo', async () => {
    server.use(http.post(url('/register'), () => HttpResponse.error()));

    renderizar(<CadastroTela />);
    await preencherEEnviar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão. Confira a internet e tente de novo.');
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeEnabled();
  });
});
