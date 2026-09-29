import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { perfilApi } from '@/mocks/fixtures/onboarding';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { PerfilTela } from './PerfilTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

const comPerfil = (troca: Partial<typeof perfilApi> = {}) =>
  server.use(http.get(url('/profile'), () => HttpResponse.json({ data: { ...perfilApi, ...troca } })));

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/perfil');
});

describe('Perfil (S17)', () => {
  it('mostra o perfil vindo da API, com os atalhos de edição', async () => {
    comPerfil();

    renderizar(<PerfilTela />);

    expect(await screen.findByRole('heading', { name: 'Camila Réus' })).toBeInTheDocument();
    expect(screen.getByText('CR')).toBeInTheDocument();
    expect(screen.getByText('No Prato Forte desde agosto de 2026')).toBeInTheDocument();
    expect(screen.getByText('meta 62,0 kg')).toBeInTheDocument();
    expect(screen.getByText('3 ou 4 vezes na semana, na Zfit de Capivari de Baixo')).toBeInTheDocument();

    const dados = screen.getByRole('link', { name: /Dados pessoais/ });
    expect(dados).toHaveAttribute('href', '/onboarding/dados?editar=1');
    expect(dados).toHaveTextContent('27 anos, 1,64 m, 58,4 kg');
    expect(screen.getByRole('link', { name: /Preferências alimentares/ })).toHaveTextContent('3 alimentos na sua cozinha');
    const restricoes = screen.getByRole('link', { name: /Restrições e alergias/ });
    expect(within(restricoes).getByText('Amendoim e castanhas')).toHaveClass('text-alerta');
    expect(screen.getByRole('link', { name: /Rotina e horários/ })).toHaveAttribute('href', '/onboarding/rotina?editar=1');
    expect(screen.getByRole('link', { name: /Rotina e horários/ })).toHaveTextContent('Treino às 19:00, seg, qua, sex');
  });

  it('sem restrições, diz "Nenhuma restrição"', async () => {
    comPerfil({ restrictions: [], other_restrictions: [] });

    renderizar(<PerfilTela />);

    expect(await screen.findByRole('link', { name: /Restrições e alergias/ })).toHaveTextContent('Nenhuma restrição');
  });

  it('quem quer mais disposição não vê régua de meta (CA05)', async () => {
    comPerfil({ goal: 'mais-disposicao', goal_weight_kg: null, goal_weight_source: null });

    renderizar(<PerfilTela />);

    expect(await screen.findByRole('heading', { name: 'Ter mais disposição' })).toBeInTheDocument();
    expect(screen.queryByText(/^meta/)).not.toBeInTheDocument();
  });

  it('se não carregar, mostra o erro e tenta de novo', async () => {
    let tentativas = 0;
    server.use(
      http.get(url('/profile'), () => {
        tentativas++;
        return tentativas === 1 ? HttpResponse.error() : HttpResponse.json({ data: perfilApi });
      }),
    );

    renderizar(<PerfilTela />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('heading', { name: 'Camila Réus' })).toBeInTheDocument();
  });
});
