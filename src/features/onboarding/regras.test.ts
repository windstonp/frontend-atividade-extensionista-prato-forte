import { describe, expect, it } from 'vitest';
import {
  erroDe,
  escreverNumero,
  faixaSaudavel,
  lerNumero,
  MENSAGENS,
  separarOutrasRestricoes,
  validarDados,
  validarRotina,
} from './regras';

describe('faixaSaudavel (espelha GoalWeightResolver)', () => {
  it.each([
    [164, 49.8, 67],
    [120, 26.6, 35.9],
    [178, 58.6, 78.9],
  ])('%i cm → %f a %f kg', (altura, min, max) => {
    expect(faixaSaudavel(altura)).toEqual({ min, max });
  });
});

describe('lerNumero e escreverNumero', () => {
  it.each([
    ['58,4', 58.4],
    ['58.4', 58.4],
    [' 70 ', 70],
    ['', null],
  ])('%j → %j', (texto, numero) => {
    expect(lerNumero(texto)).toBe(numero);
  });

  it.each(['abc', '5,8,4', '-3'])('%j não é número', (texto) => {
    expect(lerNumero(texto)).toBeNaN();
  });

  it('escreve com vírgula e deixa vazio o que não existe', () => {
    expect(escreverNumero(58.4)).toBe('58,4');
    expect(escreverNumero(null)).toBe('');
  });
});

describe('separarOutrasRestricoes', () => {
  it('separa por vírgula, sem vazios nem repetidos', () => {
    expect(separarOutrasRestricoes('camarão, pimenta,, Camarão ,')).toEqual(['camarão', 'pimenta']);
  });
});

describe('validarDados', () => {
  const ok = { preferredName: 'Camila', age: '27', heightCm: '164', weightKg: '58,4', sex: 'feminino' as const, goalWeightKg: '62' };

  it('aceita os dados da Camila', () => {
    expect(validarDados(ok, 'ganhar-massa')).toEqual({});
  });

  it.each([
    ['nome em branco', { preferredName: '  ' }, 'preferredName', MENSAGENS.nome],
    ['idade 17', { age: '17' }, 'age', MENSAGENS.idade],
    ['idade quebrada', { age: '27,5' }, 'age', MENSAGENS.idade],
    ['altura 119', { heightCm: '119' }, 'heightCm', MENSAGENS.altura],
    ['peso com 2 casas', { weightKg: '58,45' }, 'weightKg', MENSAGENS.peso],
    ['peso em texto', { weightKg: 'abc' }, 'weightKg', MENSAGENS.peso],
    ['sem sexo', { sex: null }, 'sex', MENSAGENS.sexo],
    ['meta abaixo do peso ao ganhar (CA02)', { goalWeightKg: '55' }, 'goalWeightKg', MENSAGENS.metaGanhar],
    ['meta acima do limite', { goalWeightKg: '251' }, 'goalWeightKg', MENSAGENS.metaFaixa],
  ])('%s', (_, troca, campo, mensagem) => {
    expect(validarDados({ ...ok, ...troca }, 'ganhar-massa')).toEqual({ [campo]: mensagem });
  });

  it('meta acima do peso ao perder', () => {
    expect(validarDados(ok, 'perder-gordura')).toEqual({ goalWeightKg: MENSAGENS.metaPerder });
  });

  it('ignora a meta quando o objetivo não usa meta', () => {
    expect(validarDados({ ...ok, goalWeightKg: '10' }, 'manter-peso')).toEqual({});
  });
});

describe('validarRotina (RN12)', () => {
  const ok = { wakeTime: '06:20', trainingTime: '19:00', sleepTime: '23:00', lunchPlace: 'marmita' as const };

  it('aceita a rotina do mock', () => {
    expect(validarRotina(ok)).toEqual({});
  });

  it('treino antes de acordar (CA06)', () => {
    expect(validarRotina({ ...ok, trainingTime: '05:00' })).toEqual({ trainingTime: MENSAGENS.treinoForaDaJanela });
  });

  it('aceita dormir depois da meia-noite', () => {
    expect(validarRotina({ ...ok, wakeTime: '10:00', trainingTime: '23:00', sleepTime: '01:30' })).toEqual({});
  });

  it('pede pelo menos 12 horas acordado', () => {
    expect(validarRotina({ ...ok, wakeTime: '09:00', trainingTime: '12:00', sleepTime: '20:00' })).toEqual({ sleepTime: MENSAGENS.janela });
  });

  it('pede o lugar do almoço e o formato da hora', () => {
    expect(validarRotina({ ...ok, wakeTime: '6h', lunchPlace: null })).toEqual({ wakeTime: MENSAGENS.horario, lunchPlace: MENSAGENS.almoco });
  });
});

describe('erroDe', () => {
  it('acha o erro do campo ou de um item dele', () => {
    expect(erroDe({ goalWeightKg: 'a' }, 'goalWeightKg')).toBe('a');
    expect(erroDe({ 'otherRestrictions.1': 'b' }, 'otherRestrictions')).toBe('b');
    expect(erroDe({}, 'age')).toBeUndefined();
  });
});
