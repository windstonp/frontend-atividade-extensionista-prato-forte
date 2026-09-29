import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gravandoEtapa, respondendoOnboarding } from '@/mocks/handlers/onboarding';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { MENSAGENS } from '../regras';
import { EtapaRestricoes } from './EtapaRestricoes';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/onboarding/restricoes');
});

describe('Etapa Restrições (S06)', () => {
  it('marca a alergia e separa "Mais alguma coisa" em itens', async () => {
    const { handler, corpos } = gravandoEtapa('restricoes');
    server.use(handler);
    const usuario = userEvent.setup();

    renderizar(<EtapaRestricoes />);
    const castanhas = await screen.findByRole('checkbox', { name: /Amendoim e castanhas/ });
    expect(castanhas).toHaveTextContent('Alergia');
    await usuario.click(castanhas);
    await usuario.type(screen.getByLabelText('Mais alguma coisa'), 'camarão, pimenta,,');
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/rotina'));
    expect(corpos).toEqual([{ restrictions: ['castanhas'], other_restrictions: ['camarão', 'pimenta'] }]);
  });

  it('abre com o que foi salvo', async () => {
    server.use(respondendoOnboarding({ answers: { restrictions: ['castanhas'], other_restrictions: ['camarão', 'pimenta'] } }));

    renderizar(<EtapaRestricoes />);

    expect(await screen.findByRole('checkbox', { name: /Amendoim e castanhas/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Mais alguma coisa')).toHaveValue('camarão, pimenta');
  });

  it('recusa mais de 10 itens, sem enviar', async () => {
    const { handler, corpos } = gravandoEtapa('restricoes');
    server.use(handler);
    const usuario = userEvent.setup();

    renderizar(<EtapaRestricoes />);
    await usuario.type(await screen.findByLabelText('Mais alguma coisa'), 'a1, a2, a3, a4, a5, a6, a7, a8, a9, b1, b2');
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText(MENSAGENS.outrasMuitas)).toBeInTheDocument();
    expect(corpos).toEqual([]);
  });
});
