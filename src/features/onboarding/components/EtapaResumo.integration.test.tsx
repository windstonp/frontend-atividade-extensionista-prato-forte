import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recarregarEm } from '@/lib/navegar';
import { previaApi, respostasDaCamila } from '@/mocks/fixtures/onboarding';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { respondendoOnboarding } from '@/mocks/handlers/onboarding';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { EtapaResumo } from './EtapaResumo';

vi.mock('next/navigation', () => import('@/test/next-navigation'));
vi.mock('@/lib/navegar', () => ({ recarregarEm: vi.fn() }));

const SEIS = ['objetivo', 'dados', 'atividade', 'preferencias', 'restricoes', 'rotina'];

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/onboarding/resumo');
  vi.mocked(recarregarEm).mockReset();
  server.use(
    respondendoOnboarding({ answers: respostasDaCamila, completed_steps: SEIS, next_step: 'resumo' }),
    http.get(url('/plans/preview-targets'), () => HttpResponse.json({ data: previaApi })),
  );
});

describe('Resumo (S08)', () => {
  it('mostra as respostas e a prévia calculada pelo backend (CA10)', async () => {
    renderizar(<EtapaResumo />);

    expect(await screen.findByText(/Com isso, seu plano começa em/)).toHaveTextContent(
      'Com isso, seu plano começa em 2.250 kcal por dia, com 115 g de proteína divididos em 5 refeições.',
    );
    expect(screen.getByText('Amendoim e castanhas, camarão')).toHaveClass('text-alerta');
    expect(screen.getByRole('link', { name: 'Editar rotina' })).toHaveAttribute('href', '/onboarding/rotina?de=resumo');
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/onboarding/rotina');
  });

  it('se a prévia falhar, esconde o bloco e deixa gerar', async () => {
    server.use(http.get(url('/plans/preview-targets'), () => erroDaApi(500, 'SERVER_ERROR', 'Algo deu errado do nosso lado. Tente de novo.')));

    renderizar(<EtapaResumo />);

    await screen.findByText('Amendoim e castanhas, camarão');
    expect(screen.getByRole('button', { name: 'Gerar meu plano' })).toBeEnabled();
    await waitFor(() => expect(screen.queryByLabelText('Calculando suas metas')).not.toBeInTheDocument());
    expect(screen.queryByText(/Com isso/)).not.toBeInTheDocument();
  });

  it('conclui e recarrega na tela Gerando', async () => {
    let concluiu = false;
    server.use(
      http.post(url('/onboarding/complete'), () => {
        concluiu = true;
        return HttpResponse.json({ data: { plan: { id: 42, status: 'pending' } } }, { status: 202 });
      }),
    );

    renderizar(<EtapaResumo />);
    await screen.findByText('Amendoim e castanhas, camarão'); // antes disso o botão é o do esqueleto
    await userEvent.setup().click(screen.getByRole('button', { name: 'Gerar meu plano' }));

    await waitFor(() => expect(recarregarEm).toHaveBeenCalledWith('/onboarding/gerando?plano=42'));
    expect(concluiu).toBe(true);
  });

  it('etapa incompleta leva a ela, avisando', async () => {
    server.use(
      http.post(url('/onboarding/complete'), () =>
        erroDaApi(422, 'VALIDATION_ERROR', 'Falta completar uma etapa.', { details: { step: 'rotina' } }),
      ),
    );

    renderizar(<EtapaResumo />);
    await screen.findByText('Amendoim e castanhas, camarão'); // antes disso o botão é o do esqueleto
    await userEvent.setup().click(screen.getByRole('button', { name: 'Gerar meu plano' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/rotina?de=resumo'));
    expect(await screen.findByText('Falta completar esta etapa.')).toBeInTheDocument();
    expect(recarregarEm).not.toHaveBeenCalled();
  });

  it('sem rede, mostra o erro e libera o botão', async () => {
    server.use(http.post(url('/onboarding/complete'), () => HttpResponse.error()));

    renderizar(<EtapaResumo />);
    await screen.findByText('Amendoim e castanhas, camarão'); // antes disso o botão é o do esqueleto
    await userEvent.setup().click(screen.getByRole('button', { name: 'Gerar meu plano' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão. Confira a internet e tente de novo.');
    expect(screen.getByRole('button', { name: 'Gerar meu plano' })).toBeEnabled();
  });
});
