import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { juntarComE, planoSemAtivo, semanaDe } from './regras';

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
