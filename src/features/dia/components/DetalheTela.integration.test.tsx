import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { diaApi, substituicoesApi } from '@/mocks/fixtures/dia';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { DetalheTela } from './DetalheTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

/** O dia depois de trocar o arroz do almoço pela batata-doce. */
function diaTrocado() {
  const dia = diaApi({ ultimaAlteracao: { id: 9, text: 'Arroz branco cozido trocado por batata-doce cozida' } });
  const almoco = dia.meals[2];
  almoco.items[0] = { ...almoco.items[0], food_id: 30, name: 'Batata-doce cozida', grams: 230, source: 'manual', replaced_from: 'Arroz branco cozido' };
  return dia;
}

describe('Detalhe da refeição (S13)', () => {
  it('troca pela folha, mostra o selo e o toast, e desfaz', async () => {
    let trocou: unknown;
    server.use(
      http.get(url('/days/today/items/5020/substitutions'), () => HttpResponse.json({ data: substituicoesApi })),
      http.post(url('/days/today/items/5020/swap'), async ({ request }) => {
        trocou = await request.json();
        return HttpResponse.json({ data: diaTrocado() });
      }),
      http.post(url('/days/today/undo'), () => HttpResponse.json({ data: diaApi() })),
    );
    const usuario = userEvent.setup();

    renderizar(<DetalheTela slot="almoco" />);
    await usuario.click(await screen.findByRole('button', { name: 'Trocar Arroz branco cozido' }));
    const folha = await screen.findByRole('dialog', { name: 'Trocar arroz branco cozido' });
    await usuario.click(await within(folha).findByRole('button', { name: 'Usar batata-doce cozida' }));

    expect(trocou).toEqual({ food_id: 30 });
    expect(await screen.findByText('Trocado')).toBeInTheDocument();
    expect(screen.getByText('No lugar de arroz branco cozido')).toBeInTheDocument();

    const aviso = screen.getByText('Arroz branco cozido trocado por batata-doce cozida').closest('[role="status"]') as HTMLElement;
    await usuario.click(within(aviso).getByRole('button', { name: 'Desfazer' }));

    expect(await screen.findByRole('button', { name: 'Trocar Arroz branco cozido' })).toBeInTheDocument();
    expect(screen.queryByText('Trocado')).toBeNull();
  });

  it('409 SUBSTITUTION_NOT_ALLOWED recarrega as opções', async () => {
    let buscas = 0;
    server.use(
      http.get(url('/days/today/items/5020/substitutions'), () => {
        buscas++;
        return HttpResponse.json({ data: substituicoesApi });
      }),
      http.post(url('/days/today/items/5020/swap'), () => erroDaApi(409, 'SUBSTITUTION_NOT_ALLOWED', 'Essa troca não está mais disponível.')),
    );
    const usuario = userEvent.setup();

    renderizar(<DetalheTela slot="almoco" />);
    await usuario.click(await screen.findByRole('button', { name: 'Trocar Arroz branco cozido' }));
    await usuario.click(await screen.findByRole('button', { name: 'Usar batata-doce cozida' }));

    await vi.waitFor(() => expect(buscas).toBe(2));
  });

  it('marca como feita e mostra "Desmarcar refeição"', async () => {
    server.use(http.patch(url('/days/today/meals/almoco'), () => HttpResponse.json({ data: diaApi({ feitas: ['almoco'] }) })));

    renderizar(<DetalheTela slot="almoco" />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Marcar como feita' }));

    expect(await screen.findByRole('button', { name: 'Desmarcar refeição' })).toBeInTheDocument();
    expect(screen.getByText('Refeição feita')).toBeInTheDocument();
  });

  it('Nutri pergunta pelo alimento mais proteico', async () => {
    renderizar(<DetalheTela slot="almoco" />);

    expect(await screen.findByRole('link', { name: /Não tenho frango grelhado em casa/ })).toHaveAttribute(
      'href',
      `/nutri?pergunta=${encodeURIComponent('Não tenho frango grelhado em casa. O que uso no lugar?')}`,
    );
  });

  it('slot que não existe mostra "Refeição não encontrada"', async () => {
    renderizar(<DetalheTela slot="ceia" />);

    expect(await screen.findByRole('heading', { name: 'Refeição não encontrada' })).toBeInTheDocument();
  });
});
