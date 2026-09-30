import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { progressoApi } from '@/mocks/fixtures/progresso';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { respondendoProgresso } from '@/mocks/handlers/progresso';
import { server } from '@/mocks/server';
import { redefinirNavegacao } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { EvolucaoTela } from './EvolucaoTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());
afterEach(() => localStorage.clear());

describe('Evolução (S15)', () => {
  it('mostra gráfico, constância e médias da API', async () => {
    renderizar(<EvolucaoTela />);

    expect(await screen.findByRole('img', { name: 'Peso de 56,8 kg para 58,4 kg, com meta de 62,0 kg' })).toBeInTheDocument();
    expect(screen.getByText('21 dias')).toBeInTheDocument();
    expect(screen.getByText('Você fica um pouco abaixo da meta de proteína nos dias sem treino.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Registrar peso da semana' })).toHaveAttribute('href', '/evolucao/peso');
  });

  it('trocar o período refaz a consulta e fica lembrado', async () => {
    const pedidos: string[] = [];
    server.use(
      http.get(url('/progress'), ({ request }) => {
        pedidos.push(new URL(request.url).searchParams.get('period') ?? '');
        return HttpResponse.json({ data: progressoApi() });
      }),
    );
    const usuario = userEvent.setup();

    renderizar(<EvolucaoTela />);
    await screen.findByRole('img', { name: /^Peso de/ });
    await usuario.click(within(screen.getByRole('radiogroup', { name: 'Período' })).getByRole('radio', { name: 'Tudo' }));

    await vi.waitFor(() => expect(pedidos).toEqual(['6w', 'all']));
    expect(localStorage.getItem('pf:periodo-evolucao')).toBe('all');
  });

  it('sem pesagens: estado vazio com "Registrar meu peso"', async () => {
    server.use(respondendoProgresso(progressoApi({ pontos: [] })));

    renderizar(<EvolucaoTela />);

    expect(await screen.findByRole('heading', { name: 'Sua linha começa na primeira pesagem' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Registrar meu peso' })).toHaveAttribute('href', '/evolucao/peso');
  });

  it('nenhum dia com refeição feita: médias vazias (CA06)', async () => {
    server.use(respondendoProgresso(progressoApi({ semMedias: true })));

    renderizar(<EvolucaoTela />);

    expect(await screen.findByText('Marque suas refeições para ver suas médias aqui.')).toBeInTheDocument();
  });

  it('"mais disposição": sem linha de meta nem previsão (CA07)', async () => {
    server.use(respondendoProgresso(progressoApi({ meta: null })));

    renderizar(<EvolucaoTela />);

    expect(await screen.findByRole('img', { name: 'Peso de 56,8 kg para 58,4 kg' })).toBeInTheDocument();
    expect(screen.queryByText(/chega na meta/)).toBeNull();
  });

  it('erro: ErrorState e "Tentar de novo" volta a buscar', async () => {
    let tentativas = 0;
    server.use(
      http.get(url('/progress'), () => {
        tentativas++;
        return tentativas === 1 ? erroDaApi(500, 'SERVER_ERROR', 'x') : HttpResponse.json({ data: progressoApi() });
      }),
    );

    renderizar(<EvolucaoTela />);
    expect(await screen.findByText('Não foi possível carregar sua evolução')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('img', { name: /^Peso de/ })).toBeInTheDocument();
  });
});
