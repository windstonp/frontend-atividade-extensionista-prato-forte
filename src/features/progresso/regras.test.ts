import { describe, expect, it } from 'vitest';
import { IMPERIAL } from '@/lib/units';
import {
  ajustarPeso,
  diasEntre,
  historico,
  hojeLocal,
  lerPesoDigitado,
  mensagemDaDiferenca,
  posicaoNaRegua,
  rotuloDoDia,
  rotulosDeData,
  textoDaPrevisao,
  textoDaVariacao,
} from './regras';
import type { PesoDoPeriodo } from './tipos';

const peso = (parcial: Partial<PesoDoPeriodo> = {}): PesoDoPeriodo => ({
  startKg: 56.8,
  currentKg: 58.4,
  goalKg: 62,
  goalSource: 'user',
  changeKg: 1.6,
  spanWeeks: 5,
  points: [
    { date: '2026-08-11', weightKg: 56.8 },
    { date: '2026-08-25', weightKg: 57.5 },
    { date: '2026-09-15', weightKg: 58.4 },
  ],
  forecast: { date: '2026-12-05', label: 'início de dezembro' },
  ...parcial,
});

describe('mensagemDaDiferenca (tabela do §4 S16)', () => {
  it.each([
    ['ganhar-massa', 0.2, 'São 200 g a mais que na última pesagem. Dentro do esperado para quem está ganhando massa.'],
    ['ganhar-massa', -0.3, 'São 300 g a menos que na última pesagem. Vale conferir se a semana teve menos refeições no plano.'],
    ['perder-gordura', 0.4, 'São 400 g a mais que na última pesagem. Oscilação de uma semana é normal. Vale olhar a constância.'],
    ['perder-gordura', -0.4, 'São 400 g a menos que na última pesagem. Dentro do esperado para quem está perdendo gordura.'],
    ['manter-peso', 0.5, 'São 500 g a mais que na última pesagem. Dentro do esperado para quem quer manter.'],
    ['manter-peso', -0.6, 'São 600 g a menos que na última pesagem. Vale olhar a constância desta semana.'],
    ['mais-disposicao', 0.3, 'São 300 g a mais que na última pesagem.'],
  ] as const)('%s, %d kg', (objetivo, diferenca, texto) => {
    expect(mensagemDaDiferenca(objetivo, diferenca, 7)).toBe(texto);
  });

  it('imperial: diferença em lb', () => {
    expect(mensagemDaDiferenca('ganhar-massa', 0.2, 7, IMPERIAL)).toBe('São 0,4 lb a mais que na última pesagem. Dentro do esperado para quem está ganhando massa.');
  });

  it('igual: "semana passada" com 5+ dias, "última pesagem" antes disso', () => {
    expect(mensagemDaDiferenca('ganhar-massa', 0, 7)).toBe('Mesmo peso da semana passada. Uma semana estável é normal.');
    expect(mensagemDaDiferenca('perder-gordura', 0.04, 2)).toBe('Mesmo peso da última pesagem.');
  });
});

describe('peso no stepper', () => {
  it('ajusta de 100 em 100 g, sem passar de 30–250', () => {
    expect(ajustarPeso(58.4, 1)).toBe(58.5);
    expect(ajustarPeso(58.4, -1)).toBe(58.3);
    expect(ajustarPeso(30, -1)).toBe(30);
    expect(ajustarPeso(250, 1)).toBe(250);
  });

  it('imperial: passo de 0,2 lb sobre o número exibido', () => {
    expect(IMPERIAL.exibir(ajustarPeso(58.4, 1, IMPERIAL))).toBe(128.9);
    expect(IMPERIAL.exibir(ajustarPeso(ajustarPeso(58.4, 1, IMPERIAL), 1, IMPERIAL))).toBe(129.1);
    expect(lerPesoDigitado('128,7', 60, IMPERIAL)).toBeCloseTo(128.7 / 2.20462, 6);
    expect(lerPesoDigitado('20', 60, IMPERIAL)).toBe(30);
  });

  it.each([
    ['58,65', 58.7],
    ['58.6', 58.6],
    ['abc', 59],
    ['', 59],
    ['20', 30],
    ['300', 250],
  ])('digitou "%s" → %d', (texto, esperado) => expect(lerPesoDigitado(texto, 59)).toBe(esperado));

  it('régua: ±1 kg em volta da base, marcador preso nas pontas', () => {
    expect(posicaoNaRegua(58.4, 58.4)).toBe(50);
    expect(posicaoNaRegua(58.9, 58.4)).toBe(75);
    expect(posicaoNaRegua(62, 58.4)).toBe(96);
    expect(posicaoNaRegua(50, 58.4)).toBe(4);
    expect(posicaoNaRegua(130, 128, 2)).toBe(96);
    expect(posicaoNaRegua(129, 128, 2)).toBe(75);
  });
});

describe('textos da Evolução', () => {
  it('previsão, falta pesagem, sem previsão e sem meta', () => {
    expect(textoDaPrevisao(peso())).toBe('No ritmo das últimas semanas, você chega na meta por volta do início de dezembro.');
    expect(textoDaPrevisao(peso({ forecast: null, points: [{ date: '2026-09-28', weightKg: 58.4 }] }))).toBe(
      'Registre mais uma pesagem para estimar quando você chega na meta.',
    );
    expect(textoDaPrevisao(peso({ forecast: null }))).toBe('Com as pesagens de agora, a linha ainda não aponta para a meta.');
    expect(textoDaPrevisao(peso({ goalKg: null, forecast: null }))).toBeNull();
  });

  it('variação usa as semanas reais da API', () => {
    expect(textoDaVariacao(peso())).toBe('+1,6 kg em 5 semanas');
    expect(textoDaVariacao(peso(), IMPERIAL)).toBe('+3,5 lb em 5 semanas');
    expect(textoDaVariacao(peso({ changeKg: -0.8, spanWeeks: 1 }))).toBe('−0,8 kg em 1 semana');
    expect(textoDaVariacao(peso({ changeKg: 0, spanWeeks: 0, points: [{ date: '2026-09-28', weightKg: 58.4 }] }))).toBe('primeira pesagem');
    expect(textoDaVariacao(peso({ changeKg: 0.3, spanWeeks: 0 }))).toBe('+0,3 kg nesta semana');
  });

  it('rótulo acessível de cada dia da constância', () => {
    expect(rotuloDoDia({ date: '2026-09-21', status: 'completo' })).toBe('21 de setembro: dia completo');
    expect(rotuloDoDia({ date: '2026-09-22', status: 'parcial' })).toBe('22 de setembro: parte das refeições');
    expect(rotuloDoDia({ date: '2026-09-23', status: 'vazio' })).toBe('23 de setembro: nenhuma refeição feita');
    expect(rotuloDoDia({ date: '2026-09-24', status: 'hoje' })).toBe('24 de setembro: hoje');
  });

  it('no máximo 6 rótulos de data, sempre com o primeiro e o último', () => {
    const pontos = Array.from({ length: 60 }, (_, i) => ({ date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`, weightKg: 60 }));
    const rotulos = rotulosDeData(pontos);
    expect(rotulos).toHaveLength(6);
    expect(rotulos[0].indice).toBe(0);
    expect(rotulos.at(-1)!.indice).toBe(59);
    expect(rotulosDeData(pontos.slice(0, 3)).map((r) => r.indice)).toEqual([0, 1, 2]);
  });
});

describe('histórico e datas', () => {
  it('últimas 4, mais recente primeiro, delta em gramas e "início" na primeira de todas', () => {
    const lista = historico([
      { id: 1, date: '2026-09-01', weightKg: 57.6 },
      { id: 2, date: '2026-09-08', weightKg: 58.0 },
      { id: 3, date: '2026-09-15', weightKg: 58.4 },
    ]);
    expect(lista).toEqual([
      { date: '2026-09-15', weightKg: 58.4, deltaG: 400 },
      { date: '2026-09-08', weightKg: 58.0, deltaG: 400 },
      { date: '2026-09-01', weightKg: 57.6, deltaG: null },
    ]);
  });

  it('hoje no fuso do aparelho e dias entre datas', () => {
    expect(hojeLocal(new Date(2026, 8, 30, 23, 30))).toBe('2026-09-30');
    expect(diasEntre('2026-09-23', '2026-09-30')).toBe(7);
  });
});
