/**
 * RN39 — a API é sempre métrica; a preferência muda só a exibição e a digitação de medidas do corpo.
 * Comida continua em gramas e medida caseira (RF30).
 */

export type Sistema = 'metric' | 'imperial';

export const LB_POR_KG = 2.20462;
export const CM_POR_POL = 2.54;

// `+ 1e-9`: 58,65 × 10 em ponto flutuante dá 586,4999…
const umaCasa = (n: number) => Math.round(n * 10 + 1e-9) / 10;
const br = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const kgParaLb = (kg: number) => kg * LB_POR_KG;
export const lbParaKg = (lb: number) => lb / LB_POR_KG;

export function cmParaPesPol(cm: number): { pes: number; pol: number } {
  const total = Math.round(cm / CM_POR_POL);
  return { pes: Math.floor(total / 12), pol: total % 12 };
}

export const pesPolParaCm = (pes: number, pol: number) => Math.round((pes * 12 + pol) * CM_POR_POL);

export interface Medidas {
  sistema: Sistema;
  unidadePeso: 'kg' | 'lb';
  /** Passo do stepper e metade da régua, na unidade exibida. */
  passo: number;
  regua: number;
  rotuloPasso: string;
  /** kg → número exibido (1 casa). */
  exibir: (kg: number) => number;
  /** número exibido → kg (sem arredondar em imperial). */
  deExibido: (valor: number) => number;
  /** kg com 1 casa, como a API aceita. */
  paraApi: (kg: number) => number;
  peso: (kg: number) => string;
  numero: (kg: number) => string;
  altura: (cm: number) => string;
  /** Diferença sem sinal: "200 g" / "0,4 lb". */
  diferenca: (kg: number) => string;
}

export const METRICO: Medidas = {
  sistema: 'metric',
  unidadePeso: 'kg',
  passo: 0.1,
  regua: 1,
  rotuloPasso: '100 gramas',
  exibir: umaCasa,
  deExibido: umaCasa,
  paraApi: umaCasa,
  peso: (kg) => `${br(umaCasa(kg))} kg`,
  numero: (kg) => br(umaCasa(kg)),
  altura: (cm) => `${(cm / 100).toFixed(2).replace('.', ',')} m`,
  diferenca: (kg) => `${Math.round((Math.abs(kg) * 1000) / 100) * 100} g`,
};

export const IMPERIAL: Medidas = {
  sistema: 'imperial',
  unidadePeso: 'lb',
  passo: 0.2,
  regua: 2,
  rotuloPasso: '0,2 libra',
  exibir: (kg) => umaCasa(kgParaLb(kg)),
  deExibido: lbParaKg,
  paraApi: umaCasa,
  peso: (kg) => `${br(umaCasa(kgParaLb(kg)))} lb`,
  numero: (kg) => br(umaCasa(kgParaLb(kg))),
  altura: (cm) => {
    const { pes, pol } = cmParaPesPol(cm);
    return `${pes} ft ${pol} in`;
  },
  diferenca: (kg) => `${br(umaCasa(kgParaLb(Math.abs(kg))))} lb`,
};

export const medidas = (sistema: Sistema): Medidas => (sistema === 'imperial' ? IMPERIAL : METRICO);
