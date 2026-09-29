import { describe, expect, it } from 'vitest';
import { camelizar, snakear } from './case';

describe('conversão de chaves', () => {
  it('converte respostas snake_case em camelCase, em profundidade', () => {
    expect(camelizar({ next_step: 'objetivo', settings: { unit_system: 'metric' }, lista: [{ food_id: 1 }] })).toEqual({
      nextStep: 'objetivo',
      settings: { unitSystem: 'metric' },
      lista: [{ foodId: 1 }],
    });
  });

  it('converte corpos camelCase em snake_case sem tocar nos valores', () => {
    expect(snakear({ passwordConfirmation: 'senhaComCamelCase1', termsAccepted: true })).toEqual({
      password_confirmation: 'senhaComCamelCase1',
      terms_accepted: true,
    });
  });

  it('deixa null, datas em texto e números como estão', () => {
    expect(camelizar({ goal_weight_kg: null, created_at: '2026-09-23T10:00:00-03:00', age: 27 })).toEqual({
      goalWeightKg: null,
      createdAt: '2026-09-23T10:00:00-03:00',
      age: 27,
    });
  });
});
