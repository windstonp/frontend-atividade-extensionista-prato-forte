import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { onboardingApi } from '@/mocks/fixtures/onboarding';
import { url } from '@/mocks/handlers/auth';
import { gravandoEtapa, respondendoOnboarding } from '@/mocks/handlers/onboarding';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { EtapaObjetivo } from './EtapaObjetivo';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/onboarding/objetivo');
});

describe('Etapa Objetivo (S02)', () => {
  it('começa sem nada marcado e só continua depois da escolha', async () => {
    const { handler, corpos } = gravandoEtapa('objetivo');
    server.use(handler);
    const usuario = userEvent.setup();

    renderizar(<EtapaObjetivo />);
    await screen.findByRole('radio', { name: /Perder gordura/ }); // espera as opções: antes delas o botão é o do esqueleto
    const continuar = screen.getByRole('button', { name: 'Continuar' });

    expect(continuar).toBeDisabled();
    expect(screen.getAllByRole('radio').map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'false', 'false', 'false']);
    expect(screen.queryByRole('link', { name: 'Voltar' })).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('radio', { name: /Perder gordura/ }));
    await usuario.click(continuar);

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/dados'));
    expect(corpos).toEqual([{ goal: 'perder-gordura' }]);
  });

  it('volta com a escolha salva marcada (CA01)', async () => {
    server.use(respondendoOnboarding({ answers: { goal: 'manter-peso' } }));

    renderizar(<EtapaObjetivo />);

    expect(await screen.findByRole('radio', { name: /Manter o peso/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('no modo edição salva, avisa e volta ao perfil', async () => {
    const { handler } = gravandoEtapa('objetivo');
    server.use(handler, respondendoOnboarding({ answers: { goal: 'ganhar-massa' } }));
    definirUrl('/onboarding/objetivo?editar=1');

    renderizar(<EtapaObjetivo />);
    await screen.findByRole('radio', { name: /Ganhar massa magra/ });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/perfil'));
    expect(await screen.findByText('Salvo.')).toBeInTheDocument();
  });

  it('avisa quando a meta de peso foi ajustada e volta ao resumo (RN11)', async () => {
    const { handler } = gravandoEtapa('objetivo', { warnings: ['GOAL_WEIGHT_RESET'] });
    server.use(handler, respondendoOnboarding({ answers: { goal: 'ganhar-massa' } }));
    definirUrl('/onboarding/objetivo?de=resumo');
    const usuario = userEvent.setup();

    renderizar(<EtapaObjetivo />);
    await usuario.click(await screen.findByRole('radio', { name: /Perder gordura/ }));
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/resumo'));
    expect(await screen.findByText('Sua meta de peso foi ajustada para o novo objetivo.')).toBeInTheDocument();
  });

  it('se não carregar, mostra o erro e tenta de novo', async () => {
    let tentativas = 0;
    server.use(
      http.get(url('/onboarding'), () => {
        tentativas++;
        return tentativas === 1 ? HttpResponse.error() : HttpResponse.json({ data: onboardingApi() });
      }),
    );

    renderizar(<EtapaObjetivo />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('radio', { name: /Ganhar massa magra/ })).toBeInTheDocument();
  });
});
