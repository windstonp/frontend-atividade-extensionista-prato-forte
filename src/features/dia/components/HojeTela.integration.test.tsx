import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usuarioApi } from '@/mocks/fixtures/usuario';
import { diaApi } from '@/mocks/fixtures/dia';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { respondendoDia } from '@/mocks/handlers/dia';
import { server } from '@/mocks/server';
import { redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { HojeTela } from './HojeTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

describe('Hoje (S11)', () => {
  it('mostra o dia da API: linha do dia, metas e atalho do Nutri', async () => {
    server.use(respondendoDia(diaApi({ feitas: ['cafe'] })));

    renderizar(<HojeTela />);

    expect(await screen.findByText('1 de 5 refeições')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /, Camila$/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Metas de hoje' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Perguntar ao Nutri sobre o lanche da manhã/ })).toHaveAttribute(
      'href',
      `/nutri?pergunta=${encodeURIComponent('Tenho uma dúvida sobre o lanche da manhã de hoje.')}`,
    );
  });

  it('marca a refeição na hora e envia ao servidor (RF13)', async () => {
    let corpo: unknown;
    server.use(
      http.patch(url('/days/2026-09-28/meals/cafe'), async ({ request }) => {
        corpo = await request.json();
        return HttpResponse.json({ data: diaApi({ feitas: ['cafe'] }) });
      }),
    );

    renderizar(<HojeTela />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Marcar café da manhã como feita' }));

    expect(await screen.findByText('1 de 5 refeições')).toBeInTheDocument();
    expect(corpo).toEqual({ done: true });
  });

  it('se salvar falhar, volta como estava e avisa', async () => {
    server.use(http.patch(url('/days/2026-09-28/meals/cafe'), () => erroDaApi(500, 'SERVER_ERROR', 'x')));

    renderizar(<HojeTela />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Marcar café da manhã como feita' }));

    expect(await screen.findByText('Não foi possível salvar. Tente de novo.')).toBeInTheDocument();
    expect(screen.getByText('0 de 5 refeições')).toBeInTheDocument();
  });

  it('última alteração vira toast com "Desfazer"', async () => {
    let desfez = false;
    server.use(
      respondendoDia(diaApi({ ultimaAlteracao: { id: 7, text: 'Arroz branco cozido trocado por batata-doce cozida' } })),
      http.post(url('/days/2026-09-28/undo'), () => {
        desfez = true;
        return HttpResponse.json({ data: diaApi() });
      }),
    );

    renderizar(<HojeTela />);
    const aviso = await screen.findByText('Arroz branco cozido trocado por batata-doce cozida');
    await userEvent.setup().click(within(aviso.closest('[role="status"]') as HTMLElement).getByRole('button', { name: 'Desfazer' }));

    await vi.waitFor(() => expect(desfez).toBe(true));
  });

  it.each([
    ['generating', 'Seu plano está quase pronto'],
    ['failed', 'Não conseguimos montar seu plano'],
  ])('sem plano ativo (%s) mostra o estado certo', async (status, titulo) => {
    server.use(
      http.get(url('/days/today'), () =>
        HttpResponse.json({ message: 'x', code: 'NO_ACTIVE_PLAN', details: { plan_status: status, plan_id: 43 } }, { status: 409 }),
      ),
    );

    renderizar(<HojeTela />);

    expect(await screen.findByRole('heading', { name: titulo })).toBeInTheDocument();
  });

  it('falhou: "Tentar de novo" pede um plano e abre o Gerando', async () => {
    server.use(
      http.get(url('/days/today'), () =>
        HttpResponse.json({ message: 'x', code: 'NO_ACTIVE_PLAN', details: { plan_status: 'failed', plan_id: 43 } }, { status: 409 }),
      ),
      http.post(url('/plans'), () => HttpResponse.json({ data: { id: 44, status: 'pending' } }, { status: 202 })),
    );

    renderizar(<HojeTela />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    await vi.waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/gerando?plano=44&voltar=%2Fhoje'));
  });

  it('erro de rede mostra o ErrorState com "Tentar de novo"', async () => {
    server.use(http.get(url('/days/today'), () => erroDaApi(500, 'SERVER_ERROR', 'x')));

    renderizar(<HojeTela />);

    expect(await screen.findByText('Não foi possível carregar seu dia')).toBeInTheDocument();
    server.use(respondendoDia(diaApi()));
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('0 de 5 refeições')).toBeInTheDocument();
  });

  it('imperial: o card de peso em lb (CA06)', async () => {
    server.use(http.get(url('/me'), () => HttpResponse.json({ data: { ...usuarioApi, settings: { unit_system: 'imperial' } } })));
    renderizar(<HojeTela />);

    expect(await screen.findByText('128,7 lb de 136,7 lb')).toBeInTheDocument();
  });

  it('convite do questionário aparece quando elegível e "Agora não" some com ele (CA04)', async () => {
    let dispensou = false;
    server.use(
      http.get(url('/usability-responses/status'), () => HttpResponse.json({ data: { round: '2026-1', responded: false, invite: !dispensou } })),
      http.post(url('/usability-responses/dismiss'), () => ((dispensou = true), new HttpResponse(null, { status: 204 }))),
    );
    renderizar(<HojeTela />);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Agora não' }));

    expect(screen.queryByText(/^Você já usa o Prato Forte há uma semana\./)).toBeNull();
    await waitFor(() => expect(dispensou).toBe(true));
  });
});
