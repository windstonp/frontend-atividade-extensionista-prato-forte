import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usuarioApi } from '@/mocks/fixtures/usuario';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { AvisoDeSaida, RedirecionarSeLogado } from './Visitante';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

describe('telas de visitante', () => {
  it('quem já está logado vai direto para o app', async () => {
    server.use(http.get(url('/me'), () => HttpResponse.json({ data: usuarioApi })));

    renderizar(<RedirecionarSeLogado />);

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/hoje'));
  });

  it('visitante fica onde está', async () => {
    renderizar(<RedirecionarSeLogado />);

    await new Promise((fim) => setTimeout(fim, 50));
    expect(roteador.replace).not.toHaveBeenCalled();
  });

  it('avisa que a conta foi apagada e limpa a URL', async () => {
    definirUrl('/?conta=apagada');

    renderizar(<AvisoDeSaida />);

    expect(await screen.findByText('Sua conta foi apagada.')).toBeInTheDocument();
    expect(roteador.replace).toHaveBeenCalledWith('/');
  });
});
