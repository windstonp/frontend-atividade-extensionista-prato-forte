import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { diaApi } from '@/mocks/fixtures/dia';
import { respondendoDia } from '@/mocks/handlers/dia';
import { server } from '@/mocks/server';
import { redefinirNavegacao } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { DietaTela } from './DietaTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

describe('Dieta (S12)', () => {
  it('abre em hoje, com a semana de segunda a domingo e refeições clicáveis', async () => {
    server.use(respondendoDia(diaApi({ data: '2026-09-30' })));

    renderizar(<DietaTela />);

    expect(await screen.findByRole('tab', { name: /qua 30/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('tab')).toHaveLength(7);
    expect(screen.getByRole('tab', { name: /seg 28/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /dom 4/ })).toBeInTheDocument();
    expect(screen.getByText('Quarta-feira, dia de treino')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Almoço/ })).toHaveAttribute('href', '/dieta/almoco');
    expect(screen.getByText('Toda refeição de hoje pode ser trocada. O Nutri ajuda quando o dia sair do plano.')).toBeInTheDocument();
  });

  it('outro dia mostra a prévia sem links (RN23)', async () => {
    server.use(
      respondendoDia(diaApi({ data: '2026-09-30' })),
      respondendoDia(diaApi({ data: '2026-10-01', hoje: false }), '2026-10-01'),
    );

    renderizar(<DietaTela />);
    await userEvent.setup().click(await screen.findByRole('tab', { name: /qui 1/ }));

    expect(await screen.findByText('Quinta-feira, dia de treino')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Almoço/ })).toBeNull();
  });

  it('dia passado sem registro mostra "Nada registrado neste dia"', async () => {
    server.use(
      respondendoDia(diaApi({ data: '2026-09-30' })),
      respondendoDia({ ...diaApi({ data: '2026-09-28', hoje: false }), meals: [] }, '2026-09-28'),
    );

    renderizar(<DietaTela />);
    await userEvent.setup().click(await screen.findByRole('tab', { name: /seg 28/ }));

    expect(await screen.findByText('Nada registrado neste dia')).toBeInTheDocument();
  });
});
