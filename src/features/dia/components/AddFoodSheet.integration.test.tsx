import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { Toaster } from '@/components/ui/Toaster';
import { describe, expect, it, vi } from 'vitest';
import { alimentosApi, leiteComLactose } from '@/mocks/fixtures/alimentos';
import { diaApi } from '@/mocks/fixtures/dia';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { camelizar } from '@/lib/api/case';
import { CHAVES } from '@/lib/chaves';
import { novoClienteDeTeste, renderizar } from '@/test/renderizar';
import { AddFoodSheet } from './AddFoodSheet';
import type { Dia } from '../tipos';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

function abrir(modo: Parameters<typeof AddFoodSheet>[0]['modo'] = { tipo: 'novo' }) {
  const cliente = novoClienteDeTeste();
  cliente.setQueryData(CHAVES.dia('today'), camelizar<Dia>(diaApi()));
  const aoFechar = vi.fn();
  renderizar(<AddFoodSheet aberta modo={modo} slot="cafe" dataChave="today" aoFechar={aoFechar} />, cliente);
  return { aoFechar };
}

describe('Adicionar alimento (S13a)', () => {
  it('recentes → busca → quantidade em ml → adicionar (CA33)', async () => {
    let corpo: unknown;
    server.use(http.post(url('/days/2026-09-28/meals/cafe/entries'), async ({ request }) => {
      corpo = await request.json();
      return HttpResponse.json({ data: diaApi() }, { status: 201 });
    }));
    const u = userEvent.setup();
    const { aoFechar } = abrir();
    const folha = await screen.findByRole('dialog', { name: 'Adicionar alimento' });

    expect(await within(folha).findByText('Você costuma comer')).toBeInTheDocument();
    await u.type(within(folha).getByRole('searchbox', { name: 'Buscar alimento' }), 'leite');
    await u.click(await within(folha).findByRole('button', { name: /^Leite integral/ }));

    expect(within(folha).getByRole('heading', { name: 'Quanto você comeu?' })).toBeInTheDocument();
    await u.click(within(folha).getByRole('button', { name: '1 copo · 200 ml' }));
    expect(within(folha).getByText('122 kcal')).toBeInTheDocument();
    await u.click(within(folha).getByRole('button', { name: 'Adicionar' }));

    expect(corpo).toEqual({ entries: [{ food_id: 12, amount: 200 }] });
    expect(aoFechar).toHaveBeenCalled();
  });

  it('restrição aparece como aviso e não bloqueia (CA34)', async () => {
    server.use(http.get(url('/foods'), () => HttpResponse.json({ data: [leiteComLactose] })));
    const u = userEvent.setup();
    abrir();
    const folha = await screen.findByRole('dialog');
    await u.type(within(folha).getByRole('searchbox'), 'leite');
    expect(await within(folha).findByText('Intolerância a lactose')).toBeInTheDocument();
    await u.click(within(folha).getByRole('button', { name: /^Leite integral/ }));
    expect(within(folha).getByText('Este alimento tem intolerância a lactose, que está nas suas restrições.')).toBeInTheDocument();
    await u.type(within(folha).getByRole('textbox', { name: 'Quantidade' }), '200');
    expect(within(folha).getByRole('button', { name: 'Adicionar' })).toBeEnabled();
  });

  it('sem resultado → cadastrar → quantidade (CA35)', async () => {
    server.use(
      http.get(url('/foods'), () => HttpResponse.json({ data: [] })),
      http.post(url('/custom-foods'), () => HttpResponse.json({ data: alimentosApi[2] }, { status: 201 })),
    );
    const u = userEvent.setup();
    abrir();
    const folha = await screen.findByRole('dialog');
    await u.type(within(folha).getByRole('searchbox'), 'barra de cereal');
    expect(await within(folha).findByText('Não achamos "barra de cereal".')).toBeInTheDocument();
    await u.click(within(folha).getByRole('button', { name: 'Cadastrar alimento' }));

    expect(within(folha).getByLabelText('Nome')).toHaveValue('barra de cereal');
    await u.type(within(folha).getByLabelText('Calorias'), '380');
    await u.type(within(folha).getByLabelText('Proteína'), '30');
    await u.type(within(folha).getByLabelText('Carboidrato'), '35');
    await u.type(within(folha).getByLabelText('Gordura'), '12');
    await u.click(within(folha).getByRole('button', { name: 'Salvar e continuar' }));

    expect(await within(folha).findByRole('heading', { name: 'Quanto você comeu?' })).toBeInTheDocument();
  });

  it('422 do cadastro aparece no campo (CA36)', async () => {
    server.use(
      http.get(url('/foods'), () => HttpResponse.json({ data: [] })),
      http.post(url('/custom-foods'), () => erroDaApi(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', { errors: { 'per_100.calories': ['Os números não batem: confira as calorias.'] } })),
    );
    const u = userEvent.setup();
    abrir();
    const folha = await screen.findByRole('dialog');
    await u.type(within(folha).getByRole('searchbox'), 'xx');
    await u.click(await within(folha).findByRole('button', { name: 'Cadastrar alimento' }));
    for (const [rotulo, v] of [['Calorias', '38'], ['Proteína', '30'], ['Carboidrato', '35'], ['Gordura', '12']] as const) {
      await u.type(within(folha).getByLabelText(rotulo), v);
    }
    await u.click(within(folha).getByRole('button', { name: 'Salvar e continuar' }));
    expect(await within(folha).findByText('Os números não batem: confira as calorias.')).toBeInTheDocument();
  });

  it('editar registro: salvar nova quantidade e remover (CA38)', async () => {
    const dia = diaApi({ feitas: ['cafe'] });
    const registro = camelizar<Dia>(dia).meals[0].entries[0];
    let patch: unknown;
    server.use(
      http.patch(url(`/days/2026-09-28/entries/${registro.id}`), async ({ request }) => { patch = await request.json(); return HttpResponse.json({ data: dia }); }),
    );
    const u = userEvent.setup();
    abrir({ tipo: 'editar', registro });
    const folha = await screen.findByRole('dialog', { name: 'Editar registro' });
    const campo = within(folha).getByRole('textbox', { name: 'Quantidade' });
    await u.clear(campo);
    await u.type(campo, '150,5');
    await u.click(within(folha).getByRole('button', { name: 'Salvar' }));
    expect(patch).toEqual({ amount: 150.5 });
  });

  it('editar outro registro mostra a quantidade dele, não a do anterior (revisão final)', async () => {
    const dia = camelizar<Dia>(diaApi({ feitas: ['cafe'] }));
    const [a, b] = dia.meals[0].entries;
    const cliente = novoClienteDeTeste();
    cliente.setQueryData(CHAVES.dia('today'), dia);
    const { rerender } = renderizar(<AddFoodSheet aberta modo={{ tipo: 'editar', registro: a }} slot="cafe" dataChave="today" aoFechar={() => {}} />, cliente);
    expect(await screen.findByRole('textbox', { name: 'Quantidade' })).toHaveValue(String(a.amount));

    rerender(
      <QueryClientProvider client={cliente}>
        <Toaster>
          <AddFoodSheet aberta modo={{ tipo: 'editar', registro: b }} slot="cafe" dataChave="today" aoFechar={() => {}} />
        </Toaster>
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('textbox', { name: 'Quantidade' })).toHaveValue(String(b.amount));
  });
});
