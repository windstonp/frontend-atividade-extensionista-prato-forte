import { describe, expect, it } from 'vitest';
import { camelizar } from '@/lib/api/case';
import { diaApi } from '@/mocks/fixtures/dia';
import { atalhosDeQuantidade, fraseDaMeta, lerQuantidade, previa, registrarSugestaoOtimista, statusDaMeta } from './registro';
import type { AlimentoBusca, Dia } from './tipos';

const meta = { calories: 450, protein: 25, carbs: 60, fat: 12 };
const c = (calories: number, protein = 25, fat = 10) => ({ calories, protein, carbs: 50, fat });

describe('RN48 espelhado', () => {
  it.each([
    [404, 'below', false], [405, 'ok', true], [495, 'ok', true], [496, 'above', true],
  ] as const)('%i kcal → %s, batida=%s', (kcal, status, batida) => {
    const r = statusDaMeta(meta, c(kcal));
    expect(r.status.calories).toBe(status);
    expect(r.goalMet).toBe(batida);
  });

  it('frases', () => {
    expect(fraseDaMeta(meta, c(0, 0, 0), false)).toBe('Nada registrado ainda.');
    expect(fraseDaMeta(meta, c(288, 0, 0), true)).toBe('Faltam 162 kcal e 25 g de proteína.');
    expect(fraseDaMeta(meta, c(430, 24, 11), true)).toBe('Meta batida.');
    expect(fraseDaMeta(meta, c(560, 30, 11), true)).toBe('Meta batida. 110 kcal acima da sugestão.');
    expect(fraseDaMeta(meta, c(450, 25, 15), true)).toBe('Meta batida. 3 g de gordura acima da sugestão.');
    expect(fraseDaMeta(meta, c(450, 10, 11), true)).toBe('Faltam 15 g de proteína.');
  });
});

describe('quantidade', () => {
  it('vírgula, limites e casas (Review Focus 3)', () => {
    expect(lerQuantidade('150,5')).toBe(150.5);
    expect(lerQuantidade(' 200 ')).toBe(200);
    expect(lerQuantidade('')).toBeNull();
    expect(lerQuantidade('0')).toBeNull();
    expect(lerQuantidade('2000,1')).toBeNull();
    expect(lerQuantidade('1,25')).toBeNull();
    expect(lerQuantidade('abc')).toBeNull();
  });

  it('atalhos sem repetir quantidade', () => {
    const leite = camelizar<AlimentoBusca>({ id: 12, kind: 'catalog', name: 'Leite integral', measure: 'ml', group: 'laticinio',
      per_100: { calories: 61, protein: 2.9, carbs: 4.3, fat: 3.2 }, portion: { amount: 200, text: '' },
      household: { label: 'copo', label_plural: 'copos', amount: 200 }, conflicts: [] });
    expect(atalhosDeQuantidade(leite)).toEqual([
      { rotulo: '1 copo · 200 ml', amount: 200 },
      { rotulo: '2 copos · 400 ml', amount: 400 },
      { rotulo: '½ porção · 100 ml', amount: 100 },
    ]);
  });

  it('prévia por 100', () => {
    expect(previa({ calories: 61, protein: 2.9, carbs: 4.3, fat: 3.2 }, 200)).toEqual({ calories: 122, protein: 5.8, carbs: 8.6, fat: 6.4 });
  });
});

describe('otimismo do "+"', () => {
  it('registra o item, marca ✓, soma consumido do dia e da refeição', () => {
    const dia = camelizar<Dia>(diaApi());
    const item = dia.meals[2].items[0];
    const depois = registrarSugestaoOtimista(dia, 'almoco', [item.id as number]);
    const almoco = depois.meals[2];

    expect(almoco.done).toBe(true);
    expect(almoco.items[0].registered).toBe(true);
    expect(almoco.entries[0]).toMatchObject({ name: item.name, amount: item.grams, suggestionItemId: item.id });
    expect(almoco.consumed.calories).toBe(item.calories);
    expect(depois.totals.consumed.calories).toBe(item.calories);
    expect(depois.meals.find((m) => m.isNext)?.slot).toBe('cafe');
  });
});
