import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { comOnboardingEm, usuarioApi } from '@/mocks/fixtures/usuario';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { EntrarTela } from './EntrarTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

const loginDevolve = (usuario: object) =>
  server.use(http.post(url('/login'), () => HttpResponse.json({ data: usuario })));

async function entrar(email = 'camila@exemplo.com') {
  const usuario = userEvent.setup();
  if (email) await usuario.type(screen.getByLabelText('E-mail'), email);
  await usuario.type(screen.getByLabelText('Senha'), 'senha1234');
  await usuario.click(screen.getByRole('button', { name: 'Entrar' }));
  return usuario;
}

describe('Entrar', () => {
  it.each([
    ['sem voltar', '/entrar', '/hoje'],
    ['voltando para onde estava (CA09)', '/entrar?voltar=%2Fdieta%2Falmoco%3Fdia%3D2', '/dieta/almoco?dia=2'],
    ['ignorando voltar externo', '/entrar?voltar=%2F%2Fevil.com', '/hoje'],
  ])('onboarding completo: %s', async (_, endereco, destino) => {
    definirUrl(endereco);
    loginDevolve(usuarioApi);

    renderizar(<EntrarTela />);
    await entrar();

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith(destino));
  });

  it('onboarding pela metade vai para a etapa (CA03)', async () => {
    loginDevolve(comOnboardingEm('atividade'));

    renderizar(<EntrarTela />);
    await entrar();

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/onboarding/atividade'));
  });

  it('senha errada mostra a mensagem genérica e não navega (CA04)', async () => {
    server.use(http.post(url('/login'), () => erroDaApi(422, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.')));

    renderizar(<EntrarTela />);
    await entrar();

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
    expect(roteador.replace).not.toHaveBeenCalled();
  });

  it('toque duplo em Entrar manda uma requisição só', async () => {
    let pedidos = 0;
    server.use(
      http.post(url('/login'), async () => {
        pedidos++;
        await new Promise((fim) => setTimeout(fim, 50));
        return HttpResponse.json({ data: usuarioApi });
      }),
    );

    renderizar(<EntrarTela />);
    const usuario = await entrar();
    await usuario.click(screen.getByRole('button', { name: /Entrando/ }));

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/hoje'));
    expect(pedidos).toBe(1);
  });

  it('sem rede avisa e libera o botão de novo', async () => {
    server.use(http.post(url('/login'), () => HttpResponse.error()));

    renderizar(<EntrarTela />);
    await entrar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão. Confira a internet e tente de novo.');
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });

  it('já vem com o e-mail do atalho do cadastro', async () => {
    definirUrl('/entrar?email=camila%40exemplo.com');

    renderizar(<EntrarTela />);

    expect(screen.getByLabelText('E-mail')).toHaveValue('camila@exemplo.com');
  });
});
