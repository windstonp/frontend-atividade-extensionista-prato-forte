import type { Goal } from '@/lib/types';
import type { FaixaSaudavel, LocalAlmoco, Sexo } from './tipos';

/** Mensagens iguais às do backend (ProfileStepRequest). */
export const MENSAGENS = {
  objetivo: 'Escolha um objetivo.',
  nome: 'Diga como podemos te chamar (até 40 letras).',
  idade: 'Use uma idade entre 18 e 100 anos.',
  altura: 'Use a altura em centímetros, entre 120 e 230.',
  peso: 'Use um peso entre 30 e 250 kg, com até uma casa decimal.',
  sexo: 'Escolha uma opção.',
  metaFaixa: 'Use uma meta entre 30 e 250 kg.',
  metaGanhar: 'Para ganhar massa, a meta precisa ser maior que o peso de hoje.',
  metaPerder: 'Para perder gordura, a meta precisa ser menor que o peso de hoje.',
  outrasMuitas: 'Use no máximo 10 itens.',
  outraTamanho: 'Cada item precisa ter de 2 a 60 letras.',
  horario: 'Use o formato 06:20.',
  janela: 'Seu dia acordado precisa ter pelo menos 12 horas.',
  treinoForaDaJanela: 'O treino precisa estar entre a hora que você acorda e a que dorme.',
  almoco: 'Escolha onde você almoça.',
} as const;

/** RN10: aviso que não bloqueia. */
export const AVISO_META_FORA =
  'Essa meta fica fora da faixa saudável para a sua altura. Tudo bem seguir — vale conversar com um profissional.';

type Erros<C extends string> = Partial<Record<C, string>>;

function limpar<C extends string>(erros: Erros<C>): Erros<C> {
  return Object.fromEntries(Object.entries(erros).filter(([, mensagem]) => mensagem)) as Erros<C>;
}

const arredondar1 = (n: number) => Math.round(n * 10) / 10;

/** IMC 18,5–24,9 para a altura, 1 casa — espelha `GoalWeightResolver::healthyRange`. */
export function faixaSaudavel(alturaCm: number): FaixaSaudavel {
  const quadrado = (alturaCm / 100) ** 2;
  return { min: arredondar1(18.5 * quadrado), max: arredondar1(24.9 * quadrado) };
}

export const alturaValida = (cm: number | null): cm is number => cm !== null && Number.isInteger(cm) && cm >= 120 && cm <= 230;

export function metaForaDaFaixa(metaKg: number, alturaCm: number) {
  const { min, max } = faixaSaudavel(alturaCm);
  return metaKg < min || metaKg > max;
}

/** RN10: só ganhar e perder pedem meta. */
export const pedeMeta = (objetivo: Goal | null) => objetivo === 'ganhar-massa' || objetivo === 'perder-gordura';

/** "58,4" ou "58.4" → 58.4; vazio → null; qualquer outra coisa → NaN. */
export function lerNumero(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.');
  if (limpo === '') return null;
  return /^\d+(\.\d+)?$/.test(limpo) ? Number(limpo) : Number.NaN;
}

export const escreverNumero = (n: number | null | undefined) => (n == null ? '' : String(n).replace('.', ','));

/** "camarão, pimenta,," → ["camarão", "pimenta"] — sem vazios nem repetidos (ignorando maiúsculas). */
export function separarOutrasRestricoes(texto: string): string[] {
  const vistos = new Set<string>();
  return texto
    .split(',')
    .map((item) => item.trim())
    .filter((item) => {
      const chave = item.toLocaleLowerCase('pt-BR');
      if (!item || vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
}

const inteiroEntre = (texto: string, min: number, max: number) => {
  const limpo = texto.trim();
  return /^\d{1,3}$/.test(limpo) && Number(limpo) >= min && Number(limpo) <= max;
};

const umaCasaEntre = (texto: string, min: number, max: number) => {
  const limpo = texto.trim();
  if (!/^\d{1,3}([.,]\d)?$/.test(limpo)) return false;
  const n = Number(limpo.replace(',', '.'));
  return n >= min && n <= max;
};

export interface CamposDados {
  preferredName: string;
  age: string;
  heightCm: string;
  weightKg: string;
  sex: Sexo | null;
  goalWeightKg: string;
}

/** Etapa `dados` (RN09, RN10), com as mensagens do backend. */
export function validarDados(d: CamposDados, objetivo: Goal | null): Erros<keyof CamposDados> {
  const nome = d.preferredName.trim();
  const pesoOk = umaCasaEntre(d.weightKg, 30, 250);

  let meta: string | undefined;
  if (pedeMeta(objetivo) && d.goalWeightKg.trim() !== '') {
    if (!umaCasaEntre(d.goalWeightKg, 30, 250)) {
      meta = MENSAGENS.metaFaixa;
    } else if (pesoOk) {
      const alvo = lerNumero(d.goalWeightKg) as number;
      const peso = lerNumero(d.weightKg) as number;
      if (objetivo === 'ganhar-massa' && alvo <= peso) meta = MENSAGENS.metaGanhar;
      if (objetivo === 'perder-gordura' && alvo >= peso) meta = MENSAGENS.metaPerder;
    }
  }

  return limpar({
    preferredName: nome.length < 1 || nome.length > 40 ? MENSAGENS.nome : undefined,
    age: inteiroEntre(d.age, 18, 100) ? undefined : MENSAGENS.idade,
    heightCm: inteiroEntre(d.heightCm, 120, 230) ? undefined : MENSAGENS.altura,
    weightKg: pesoOk ? undefined : MENSAGENS.peso,
    sex: d.sex ? undefined : MENSAGENS.sexo,
    goalWeightKg: meta,
  });
}

export interface CamposRotina {
  wakeTime: string;
  trainingTime: string;
  sleepTime: string;
  lunchPlace: LocalAlmoco | null;
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const minutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

/** Etapa `rotina` (RN12) — espelha o `after()` do ProfileStepRequest. */
export function validarRotina(r: CamposRotina): Erros<keyof CamposRotina> {
  const erros: Erros<keyof CamposRotina> = {};
  for (const campo of ['wakeTime', 'trainingTime', 'sleepTime'] as const) {
    if (!HORA.test(r[campo])) erros[campo] = MENSAGENS.horario;
  }
  if (!r.lunchPlace) erros.lunchPlace = MENSAGENS.almoco;
  if (erros.wakeTime || erros.trainingTime || erros.sleepTime) return erros;

  const acorda = minutos(r.wakeTime);
  let dorme = minutos(r.sleepTime);
  let treino = minutos(r.trainingTime);
  if (dorme <= acorda) dorme += 24 * 60; // dorme depois da meia-noite
  if (dorme - acorda < 12 * 60) return { ...erros, sleepTime: MENSAGENS.janela };
  if (treino < acorda) treino += 24 * 60;
  if (treino >= dorme) erros.trainingTime = MENSAGENS.treinoForaDaJanela;
  return erros;
}

/** Primeira mensagem do campo ou de um item dele ("otherRestrictions.1"), vinda de um 422. */
export function erroDe(erros: Record<string, string>, campo: string): string | undefined {
  return erros[campo] ?? Object.entries(erros).find(([chave]) => chave.startsWith(`${campo}.`))?.[1];
}
