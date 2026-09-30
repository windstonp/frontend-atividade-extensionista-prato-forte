import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { perfilApi } from '@/mocks/fixtures/onboarding';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { PreferenciasTela } from './PreferenciasTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

let corpos: unknown[];

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/perfil/preferencias');
  corpos = [];
  server.use(
    http.get(url('/profile'), () => HttpResponse.json({ data: perfilApi })),
    http.put(url('/profile/preferences'), async ({ request }) => {
      corpos.push(await request.json());
      return HttpResponse.json({ data: perfilApi, meta: { plan_effect: 'none', plan_id: null } });
    }),
  );
});

describe('Preferências e restrições (S18)', () => {
  it('abre com o perfil e só libera "Salvar alterações" quando algo muda', async () => {
    const usuario = userEvent.setup();
    renderizar(<PreferenciasTela />);

    const salvar = await screen.findByRole('button', { name: 'Salvar alterações' });
    expect(salvar).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /Amendoim e castanhas/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: 'Fígado bovino' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Restrições e alergias refazem seu plano na hora. O resto entra quando você refizer o plano.')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Maçã' }));
    expect(salvar).toBeEnabled();
    await usuario.click(screen.getByRole('button', { name: 'Maçã' }));
    expect(salvar).toBeDisabled();
  });

  it('salva as quatro listas inteiras e volta ao perfil (RF17)', async () => {
    const usuario = userEvent.setup();
    renderizar(<PreferenciasTela />);

    await usuario.click(await screen.findByRole('checkbox', { name: /Intolerância a lactose/ }));
    await usuario.click(screen.getByRole('button', { name: 'Maçã' }));
    await usuario.click(screen.getByRole('button', { name: 'Jiló' }));
    await usuario.click(screen.getByRole('button', { name: 'Remover camarão' }));
    await usuario.click(screen.getByRole('button', { name: 'Adicionar outro alimento' }));
    await usuario.type(screen.getByLabelText('Outro alimento'), 'pimenta{Enter}');
    expect(screen.getByRole('button', { name: 'Remover pimenta' })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/perfil'));
    expect(await screen.findByText('Salvo.')).toBeInTheDocument();
    expect(corpos).toEqual([
      {
        restrictions: ['lactose', 'castanhas'],
        other_restrictions: ['pimenta'],
        pantry_items: ['ovos', 'frango', 'arroz-e-feijao', 'maca'],
        disliked_food_ids: [88, 93],
      },
    ]);
  });

  it('não perde o alimento digitado se a pessoa salvar sem tocar em "Adicionar"', async () => {
    const usuario = userEvent.setup();
    renderizar(<PreferenciasTela />);

    await usuario.click(await screen.findByRole('button', { name: 'Adicionar outro alimento' }));
    await usuario.type(screen.getByLabelText('Outro alimento'), 'pimenta');
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/perfil'));
    expect(corpos).toEqual([expect.objectContaining({ other_restrictions: ['camarão', 'pimenta'] })]);
  });

  it('não aceita outro alimento repetido', async () => {
    const usuario = userEvent.setup();
    renderizar(<PreferenciasTela />);

    await usuario.click(await screen.findByRole('button', { name: 'Adicionar outro alimento' }));
    await usuario.type(screen.getByLabelText('Outro alimento'), 'Camarão');
    await usuario.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByText('Esse item já está na lista.')).toBeInTheDocument();
  });

  it('sem rede, avisa e fica na tela', async () => {
    server.use(http.put(url('/profile/preferences'), () => HttpResponse.error()));
    const usuario = userEvent.setup();
    renderizar(<PreferenciasTela />);

    await usuario.click(await screen.findByRole('button', { name: 'Maçã' }));
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão. Confira a internet e tente de novo.');
    expect(roteador.push).not.toHaveBeenCalled();
  });
  it('restrição nova leva ao Gerando (RN21)', async () => {
    server.use(
      http.put(url('/profile/preferences'), () =>
        HttpResponse.json({ data: perfilApi, meta: { plan_effect: 'regeneration_started', plan_id: 51 } }),
      ),
    );
    const usuario = userEvent.setup();

    renderizar(<PreferenciasTela />);
    await usuario.click(await screen.findByRole('checkbox', { name: /Frutos do mar/ }));
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/gerando?plano=51&voltar=%2Fperfil'));
  });
});
