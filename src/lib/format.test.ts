import { describe, expect, it } from 'vitest';
import * as formato from './format';

describe('format', () => {
  it('exporta funções de formatação', () => {
    expect(Object.values(formato).some((f) => typeof f === 'function')).toBe(true);
  });
});
