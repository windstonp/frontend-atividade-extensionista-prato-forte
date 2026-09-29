import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { camelizar } from '@/lib/api/case';
import type { User } from '@/lib/types';
import { usuarioApi } from '@/mocks/fixtures/usuario';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { novoClienteDeTeste, renderizar } from '@/test/renderizar';
import { CHAVE_ME } from '../hooks';
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

  it('sessão que morreu com o usuário ainda em cache não volta para o app (sem laço com o AuthGate)', async () => {
    const cliente = novoClienteDeTeste();
    cliente.setQueryData(CHAVE_ME, camelizar<User>(usuarioApi));
    await cliente.refetchQueries({ queryKey: CHAVE_ME }); // /me agora responde 401 (handler padrão)

    renderizar(<RedirecionarSeLogado />, cliente);

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
