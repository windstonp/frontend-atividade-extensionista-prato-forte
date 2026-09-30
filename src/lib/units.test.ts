import { describe, expect, it } from 'vitest';
import { cmParaPesPol, IMPERIAL, kgParaLb, lbParaKg, METRICO, pesPolParaCm } from './units';

describe('units (RN39)', () => {
  it('kg ↔ lb com o fator da spec; 128,7 lb vai para a API como 58,4 kg (CA06)', () => {
    expect(kgParaLb(1)).toBeCloseTo(2.20462, 5);
    expect(lbParaKg(2.20462)).toBeCloseTo(1, 5);
    expect(IMPERIAL.paraApi(IMPERIAL.deExibido(128.7))).toBe(58.4);
    expect(IMPERIAL.exibir(58.4)).toBe(128.7);
  });

  it('cm ↔ pés e polegadas', () => {
    expect(cmParaPesPol(164)).toEqual({ pes: 5, pol: 5 });
    expect(cmParaPesPol(180)).toEqual({ pes: 5, pol: 11 });
    expect(pesPolParaCm(5, 11)).toBe(180);
    expect(pesPolParaCm(5, 5)).toBe(165);
  });

  it('formatos: métrico igual ao de hoje, imperial em lb e ft/in', () => {
    expect(METRICO.peso(58.4)).toBe('58,4 kg');
    expect(METRICO.altura(164)).toBe('1,64 m');
    expect(METRICO.diferenca(0.2)).toBe('200 g');
    expect(METRICO.numero(58.4)).toBe('58,4');
    expect(IMPERIAL.peso(58.4)).toBe('128,7 lb');
    expect(IMPERIAL.altura(164)).toBe('5 ft 5 in');
    expect(IMPERIAL.diferenca(0.2)).toBe('0,4 lb');
    expect(IMPERIAL.diferenca(-0.4)).toBe('0,9 lb');
  });

  it('passo e régua do stepper', () => {
    expect([METRICO.passo, METRICO.regua, METRICO.rotuloPasso]).toEqual([0.1, 1, '100 gramas']);
    expect([IMPERIAL.passo, IMPERIAL.regua, IMPERIAL.rotuloPasso]).toEqual([0.2, 2, '0,2 libra']);
  });

  it('paraApi arredonda a 0,1 kg', () => {
    expect(METRICO.paraApi(58.46)).toBe(58.5);
    expect(IMPERIAL.paraApi(58.4312)).toBe(58.4);
  });
});
