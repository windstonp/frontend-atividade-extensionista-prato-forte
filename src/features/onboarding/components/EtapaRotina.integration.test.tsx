import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gravandoEtapa, respondendoOnboarding } from '@/mocks/handlers/onboarding';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { MENSAGENS } from '../regras';
import { EtapaRotina } from './EtapaRotina';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/onboarding/rotina');
});

describe('Etapa Rotina (S07)', () => {
  it('salva a rotina do mock', async () => {
    const { handler, corpos } = gravandoEtapa('rotina');
    server.use(handler);
    const usuario = userEvent.setup();

    renderizar(<EtapaRotina />);
    for (const dia of ['sexta', 'segunda', 'quarta']) await usuario.click(await screen.findByRole('button', { name: dia }));
    await usuario.click(screen.getByRole('button', { name: 'Marmita no trabalho' }));
    expect(screen.getByText(/Quem leva marmita/)).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/resumo'));
    expect(corpos).toEqual([
      { wake_time: '06:20', training_time: '19:00', sleep_time: '23:00', training_days: [1, 3, 5], lunch_place: 'marmita' },
    ]);
  });

  it('treino antes de acordar mostra o erro no campo e não envia (CA06)', async () => {
    const { handler, corpos } = gravandoEtapa('rotina');
    server.use(handler, respondendoOnboarding({ answers: { lunch_place: 'casa' } }));

    renderizar(<EtapaRotina />);
    fireEvent.change(await screen.findByLabelText('Treina às'), { target: { value: '05:00' } });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText(MENSAGENS.treinoForaDaJanela)).toBeInTheDocument();
    expect(screen.getByLabelText('Treina às')).toHaveAttribute('aria-invalid', 'true');
    expect(corpos).toEqual([]);
  });

  it('pede o lugar do almoço', async () => {
    renderizar(<EtapaRotina />);
    await screen.findByLabelText('Treina às'); // antes disso o botão é o do esqueleto
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText(MENSAGENS.almoco)).toBeInTheDocument();
  });
});
