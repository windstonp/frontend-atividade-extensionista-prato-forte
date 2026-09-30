import { describe, expect, it } from 'vitest';
import { camelizar } from '@/lib/api/case';
import { ApiError } from '@/lib/api/errors';
import { diaApi } from '@/mocks/fixtures/dia';
import { juntarComE, planoSemAtivo, recalcularDia, semanaDe } from './regras';
import type { Dia } from './tipos';

const dia = () => camelizar<Dia>(diaApi());

describe('recalcularDia (RN24, otimista)', () => {
  it('marcar o almoço soma exatamente o almoço no consumido e move a próxima', () => {
    const antes = dia();
    const almoco = antes.meals.find((m) => m.slot === 'almoco')!;
    const cafe = antes.meals.find((m) => m.slot === 'cafe')!;

    const depois = recalcularDia(recalcularDia(antes, 'cafe', true), 'almoco', true);

    expect(depois.totals.consumed.calories).toBe(cafe.calories + almoco.calories);
    expect(depois.totals.remaining.calories).toBe(antes.totals.planned.calories - cafe.calories - almoco.calories);
    expect(depois.meals.map((m) => m.isNext)).toEqual([false, true, false, false, false]);
  });

  it('desmarcar volta ao que era', () => {
    const antes = dia();
    expect(recalcularDia(recalcularDia(antes, 'cafe', true), 'cafe', false)).toEqual(antes);
  });

  it('com tudo feito não há próxima', () => {
    let d = dia();
    for (const m of d.meals) d = recalcularDia(d, m.slot, true);
    expect(d.meals.some((m) => m.isNext)).toBe(false);
    expect(d.totals.remaining.calories).toBe(0);
  });
});

describe('semanaDe', () => {
  it.each([
    ['2026-09-28', ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']],
    ['2026-10-04', ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']],
    ['2026-12-31', ['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03']],
  ])('semana de %s começa na segunda', (hoje, esperado) => {
    expect(semanaDe(hoje)).toEqual(esperado);
  });
});

describe('juntarComE e planoSemAtivo', () => {
  it('junta com vírgula e "e"', () => {
    expect(juntarComE(['amendoim e castanhas'])).toBe('amendoim e castanhas');
    expect(juntarComE(['lactose', 'glúten', 'camarão'])).toBe('lactose, glúten e camarão');
  });

  it('lê o status do plano no 409 NO_ACTIVE_PLAN', () => {
    const erro = new ApiError(409, 'NO_ACTIVE_PLAN', 'x', {}, { planStatus: 'generating', planId: 43 });
    expect(planoSemAtivo(erro)).toEqual({ status: 'generating', planId: 43 });
    expect(planoSemAtivo(new ApiError(500, 'SERVER_ERROR', 'x'))).toBeNull();
  });
});
