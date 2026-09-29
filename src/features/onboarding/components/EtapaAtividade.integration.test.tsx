import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gravandoEtapa, respondendoOnboarding } from '@/mocks/handlers/onboarding';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { EtapaAtividade } from './EtapaAtividade';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/onboarding/atividade');
});

describe('Etapa Atividade (S04)', () => {
  it('só continua com as duas escolhas, e salva as duas', async () => {
    const { handler, corpos } = gravandoEtapa('atividade');
    server.use(handler);
    const usuario = userEvent.setup();

    renderizar(<EtapaAtividade />);
    await usuario.click(await screen.findByRole('radio', { name: /3 ou 4 vezes na semana/ }));
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    await usuario.click(screen.getByRole('radio', { name: 'Sentada' }));
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/preferencias'));
    expect(corpos).toEqual([{ activity_level: 'moderado', work_posture: 'sentada' }]);
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/onboarding/dados');
  });

  it('abre com o que foi salvo', async () => {
    server.use(respondendoOnboarding({ answers: { activity_level: 'intenso', work_posture: 'em-pe' } }));

    renderizar(<EtapaAtividade />);

    expect(await screen.findByRole('radio', { name: /5 ou 6 vezes na semana/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Em pé' })).toHaveAttribute('aria-checked', 'true');
  });
});
