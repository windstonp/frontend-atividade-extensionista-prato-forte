import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gravandoEtapa, respondendoOnboarding } from '@/mocks/handlers/onboarding';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { EtapaPreferencias } from './EtapaPreferencias';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/onboarding/preferencias');
});

describe('Etapa Preferências (S05)', () => {
  it('marca itens da cozinha, conta, dá a dica e salva na ordem do catálogo', async () => {
    const { handler, corpos } = gravandoEtapa('preferencias');
    server.use(handler);
    const usuario = userEvent.setup();

    renderizar(<EtapaPreferencias />);
    expect(await screen.findByText('Nada marcado ainda')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Frango' }));
    await usuario.click(screen.getByRole('button', { name: 'Ovos' }));

    expect(screen.getByText('2 alimentos marcados')).toBeInTheDocument();
    expect(screen.getByText('Marque pelo menos uns 5 para o cardápio ficar com a sua cara.')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/restricoes'));
    expect(corpos).toEqual([{ pantry_items: ['ovos', 'frango'] }]);
  });

  it('com 5 ou mais marcados a dica some', async () => {
    server.use(respondendoOnboarding({ answers: { pantry_items: ['ovos', 'frango', 'arroz-e-feijao', 'banana', 'aveia'] } }));

    renderizar(<EtapaPreferencias />);

    expect(await screen.findByText('5 alimentos marcados')).toBeInTheDocument();
    expect(screen.queryByText(/Marque pelo menos uns 5/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aveia' })).toHaveAttribute('aria-pressed', 'true');
  });
});
