import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { alimentosApi } from '@/mocks/fixtures/alimentos';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { buscarAlimentos, criarAlimentoProprio } from './alimentos';
import { registrar } from './dia';

describe('API de alimentos e registros', () => {
  it('busca devolve em camelCase', async () => {
    server.use(http.get(url('/foods'), ({ request }) => {
      expect(new URL(request.url).searchParams.get('q')).toBe('leite');
      return HttpResponse.json({ data: alimentosApi });
    }));
    const [leite] = await buscarAlimentos('leite');
    expect(leite.per100.calories).toBe(61);
    expect(leite.household?.labelPlural).toBe('copos');
  });

  it('registrar manda snake_case para a data da tela', async () => {
    let corpo: unknown;
    server.use(http.post(url('/days/2026-09-27/meals/jantar/entries'), async ({ request }) => {
      corpo = await request.json();
      return HttpResponse.json({ data: (await import('@/mocks/fixtures/dia')).diaApi({ data: '2026-09-27', hoje: false }) }, { status: 201 });
    }));
    await registrar('2026-09-27', 'jantar', [{ foodId: 12, amount: 200 }, { suggestionItemId: 5040 }]);
    expect(corpo).toEqual({ entries: [{ food_id: 12, amount: 200 }, { suggestion_item_id: 5040 }] });
  });

  it('cadastro de alimento próprio', async () => {
    server.use(http.post(url('/custom-foods'), async ({ request }) => HttpResponse.json({ data: { id: 4, kind: 'custom', ...(await request.json() as object), group: null, portion: null, household: null, conflicts: [] } }, { status: 201 })));
    const a = await criarAlimentoProprio({ name: 'Barra', measure: 'g', per100: { calories: 380, protein: 30, carbs: 35, fat: 12 } });
    expect(a.kind).toBe('custom');
  });
});
