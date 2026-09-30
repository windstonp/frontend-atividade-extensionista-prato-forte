import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { QuestionarioTela } from './QuestionarioTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));
beforeEach(() => redefinirNavegacao());

const RESPOSTAS = ['Concordo', 'Discordo', 'Concordo totalmente', 'Discordo totalmente', 'Concordo', 'Discordo', 'Concordo totalmente', 'Discordo totalmente', 'Concordo', 'Discordo'];

async function responderAteOFim(usuario: ReturnType<typeof userEvent.setup>) {
  for (const [i, resposta] of RESPOSTAS.entries()) {
    expect(await screen.findByText(`Etapa ${i + 1} de 13`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    await usuario.click(screen.getByRole('radio', { name: resposta }));
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));
  }
  await usuario.click(await screen.findByRole('radio', { name: '4' }));
  await usuario.click(screen.getByRole('button', { name: 'Continuar' }));
  await usuario.type(await screen.findByLabelText('O que mais te ajudou?'), 'Os horários batem com o meu treino.');
  await usuario.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(await screen.findByLabelText('O que atrapalhou ou faltou?')).toHaveAttribute('maxlength', '1000');
  await usuario.click(screen.getByRole('button', { name: 'Enviar' }));
}

describe('Questionário (N08)', () => {
  it('13 telas, envia as respostas e agradece (CA05)', async () => {
    let corpo: unknown;
    server.use(http.post(url('/usability-responses'), async ({ request }) => ((corpo = await request.json()), HttpResponse.json({ data: { round: '2026-1', responded: true } }, { status: 201 }))));
    const usuario = userEvent.setup();

    renderizar(<QuestionarioTela />);
    await responderAteOFim(usuario);

    expect(await screen.findByRole('heading', { name: 'Obrigado por avaliar!' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o app' })).toHaveAttribute('href', '/hoje');
    expect(corpo).toEqual({ sus_answers: [4, 2, 5, 1, 4, 2, 5, 1, 4, 2], usefulness: 4, liked: 'Os horários batem com o meu treino.', disliked: null });
  });

  it('voltar não perde a resposta', async () => {
    const usuario = userEvent.setup();
    renderizar(<QuestionarioTela />);

    await usuario.click(await screen.findByRole('radio', { name: 'Concordo' }));
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));
    await usuario.click(await screen.findByRole('button', { name: 'Voltar' }));

    expect(await screen.findByRole('radio', { name: 'Concordo' })).toHaveAttribute('aria-checked', 'true');
  });

  it('erro no envio: fica na última tela e "Tentar de novo" reenvia', async () => {
    let tentativas = 0;
    server.use(
      http.post(url('/usability-responses'), () => (++tentativas === 1 ? erroDaApi(500, 'SERVER_ERROR', 'Algo deu errado do nosso lado. Tente de novo.') : HttpResponse.json({ data: { round: '2026-1', responded: true } }, { status: 201 }))),
    );
    const usuario = userEvent.setup();

    renderizar(<QuestionarioTela />);
    await responderAteOFim(usuario);
    expect(await screen.findByText('Algo deu errado do nosso lado. Tente de novo.')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('heading', { name: 'Obrigado por avaliar!' })).toBeInTheDocument();
  });

  it('já respondeu (409): agradece (CA06)', async () => {
    server.use(http.post(url('/usability-responses'), () => erroDaApi(409, 'ALREADY_RESPONDED', 'Você já respondeu. Obrigado!')));
    const usuario = userEvent.setup();

    renderizar(<QuestionarioTela />);
    await responderAteOFim(usuario);

    expect(await screen.findByRole('heading', { name: 'Obrigado por avaliar!' })).toBeInTheDocument();
  });
});
