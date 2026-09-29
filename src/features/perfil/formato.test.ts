import { describe, expect, it } from 'vitest';
import { desdeQuando, iniciais, metros } from './formato';

describe('formato do perfil', () => {
  it.each([
    ['Camila Réus', 'CR'],
    ['Rafael Lima Souza', 'RS'],
    ['Nina', 'N'],
    ['  ana  maria ', 'AM'],
  ])('iniciais de %j → %s', (nome, esperado) => {
    expect(iniciais(nome)).toBe(esperado);
  });

  it('diz desde quando a pessoa usa o app, no fuso de São Paulo (P1)', () => {
    expect(desdeQuando('2026-08-11T09:00:00-03:00')).toBe('agosto de 2026');
    expect(desdeQuando('2026-09-01T01:00:00+00:00')).toBe('agosto de 2026');
  });

  it('escreve a altura em metros', () => {
    expect(metros(164)).toBe('1,64 m');
  });
});
