import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { comOnboardingEm, usuarioApi } from '@/mocks/fixtures/usuario';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { AuthGate } from './AuthGate';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

const comUsuario = (usuario: object) => server.use(http.get(url('/me'), () => HttpResponse.json({ data: usuario })));

beforeEach(() => redefinirNavegacao());

describe('AuthGate', () => {
  it('sessão expirada manda para o login com caminho e busca (CA09)', async () => {
    definirUrl('/dieta/almoco?dia=2');

    renderizar(<AuthGate area="app"><p>conteúdo</p></AuthGate>);

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/entrar?voltar=%2Fdieta%2Falmoco%3Fdia%3D2'));
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument();
  });

  it('no app com onboarding pela metade vai para a etapa', async () => {
    comUsuario(comOnboardingEm('dados'));
    definirUrl('/hoje');

    renderizar(<AuthGate area="app"><p>conteúdo</p></AuthGate>);

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/onboarding/dados'));
  });

  it('mostra o app para quem concluiu o onboarding', async () => {
    comUsuario(usuarioApi);
    definirUrl('/hoje');

    renderizar(<AuthGate area="app"><p>conteúdo</p></AuthGate>);

    expect(await screen.findByText('conteúdo')).toBeInTheDocument();
    expect(roteador.replace).not.toHaveBeenCalled();
  });

  it('no onboarding, conta concluída vai para o Hoje', async () => {
    comUsuario(usuarioApi);
    definirUrl('/onboarding/objetivo');

    renderizar(<AuthGate area="onboarding"><p>etapa</p></AuthGate>);

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith('/hoje'));
  });

  it('sem rede mostra o erro com "Tentar de novo" em vez de mandar para o login', async () => {
    server.use(http.get(url('/me'), () => HttpResponse.error()));
    definirUrl('/hoje');

    renderizar(<AuthGate area="app"><p>conteúdo</p></AuthGate>);

    expect(await screen.findByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    expect(roteador.replace).not.toHaveBeenCalled();
  });
});
