import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { diaApi, refeicaoApi, registroDaSugestao, substituicoesApi } from '@/mocks/fixtures/dia';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { respondendoDia } from '@/mocks/handlers/dia';
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
      http.get(url('/days/2026-09-28/items/5020/substitutions'), () => HttpResponse.json({ data: substituicoesApi })),
      http.post(url('/days/2026-09-28/items/5020/swap'), async ({ request }) => {
        trocou = await request.json();
        return HttpResponse.json({ data: diaTrocado() });
      }),
      http.post(url('/days/2026-09-28/undo'), () => HttpResponse.json({ data: diaApi() })),
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
      http.get(url('/days/2026-09-28/items/5020/substitutions'), () => {
        buscas++;
        return HttpResponse.json({ data: substituicoesApi });
      }),
      http.post(url('/days/2026-09-28/items/5020/swap'), () => erroDaApi(409, 'SUBSTITUTION_NOT_ALLOWED', 'Essa troca não está mais disponível.')),
    );
    const usuario = userEvent.setup();

    renderizar(<DetalheTela slot="almoco" />);
    await usuario.click(await screen.findByRole('button', { name: 'Trocar Arroz branco cozido' }));
    await usuario.click(await screen.findByRole('button', { name: 'Usar batata-doce cozida' }));

    await vi.waitFor(() => expect(buscas).toBe(2));
  });

  it('"+" registra na hora, vira ✓ e a régua sobe (CA31, Review Focus 1)', async () => {
    let pedidos = 0;
    server.use(http.post(url('/days/2026-09-28/meals/almoco/entries'), async () => {
      pedidos++;
      await delay(100);
      const dia = diaApi({ registros: { almoco: [registroDaSugestao(refeicaoApi('almoco', 2, false, false).items[0])] } });
      return HttpResponse.json({ data: dia }, { status: 201 });
    }));
    const u = userEvent.setup();
    renderizar(<DetalheTela slot="almoco" />);

    const mais = await screen.findByRole('button', { name: 'Registrar Arroz branco cozido, 150 g, mais ou menos 6 colheres de sopa' });
    await u.click(mais);
    expect(await screen.findByRole('button', { name: 'Arroz branco cozido já registrado' })).toBeDisabled();
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '192');
    await waitFor(() => expect(pedidos).toBe(1));
  });

  it('"Adicionar os 4" manda todos numa requisição (CA32)', async () => {
    let corpo: unknown;
    server.use(http.post(url('/days/2026-09-28/meals/almoco/entries'), async ({ request }) => {
      corpo = await request.json();
      return HttpResponse.json({ data: diaApi({ feitas: ['almoco'] }) }, { status: 201 });
    }));
    const u = userEvent.setup();
    renderizar(<DetalheTela slot="almoco" />);
    await u.click(await screen.findByRole('button', { name: 'Adicionar os 4' }));
    expect(corpo).toEqual({ entries: [5020, 5021, 5022, 5023].map((id) => ({ suggestion_item_id: id })) });
  });

  it('não tem mais "Marcar como feita"', async () => {
    renderizar(<DetalheTela slot="almoco" />);
    await screen.findByRole('heading', { name: 'Almoço' });
    expect(screen.queryByRole('button', { name: /Marcar como feita|Desmarcar refeição/ })).toBeNull();
  });

  it('ontem: título, sem "Trocar", escreve na data de ontem (CA39)', async () => {
    let caminho = '';
    server.use(
      http.get(url('/days/2026-09-27'), () => HttpResponse.json({ data: diaApi({ data: '2026-09-27', hoje: false, editavel: true }) })),
      http.post(url('/days/2026-09-27/meals/jantar/entries'), ({ request }) => {
        caminho = new URL(request.url).pathname;
        return HttpResponse.json({ data: diaApi({ data: '2026-09-27', hoje: false, editavel: true, feitas: ['jantar'] }) }, { status: 201 });
      }),
    );
    const u = userEvent.setup();
    renderizar(<DetalheTela slot="jantar" data="2026-09-27" />);
    expect(await screen.findByText(/^Ontem às 20:30/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Trocar/ })).toBeNull();
    await u.click(screen.getByRole('button', { name: /^Registrar Patinho moído/ }));
    await waitFor(() => expect(caminho).toBe('/api/v1/days/2026-09-27/meals/jantar/entries'));
  });

  it('dia virou: DAY_NOT_EDITABLE avisa e recarrega (Review Focus 4)', async () => {
    server.use(http.post(url('/days/2026-09-28/meals/almoco/entries'), () => erroDaApi(409, 'DAY_NOT_EDITABLE', 'Esse dia não pode mais ser alterado.')));
    const u = userEvent.setup();
    renderizar(<DetalheTela slot="almoco" />);
    await u.click(await screen.findByRole('button', { name: /^Registrar Arroz/ }));
    expect(await screen.findByText('O dia virou. Atualizamos para hoje.')).toBeInTheDocument();
  });

  it('tocar num registro abre a edição', async () => {
    server.use(respondendoDia(diaApi({ feitas: ['almoco'] })));
    const u = userEvent.setup();
    renderizar(<DetalheTela slot="almoco" />);
    await u.click(await screen.findByRole('button', { name: /^Arroz branco cozido, 150 g/ }));
    expect(await screen.findByRole('dialog', { name: 'Editar registro' })).toBeInTheDocument();
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
