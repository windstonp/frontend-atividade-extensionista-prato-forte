import { ApiError } from '@/lib/api/errors';
import type { Dia, Slot, StatusDoPlano, Totais } from './tipos';

const umaCasa = (n: number) => Math.round(n * 10) / 10;

function somar(partes: Totais[]): Totais {
  const t = partes.reduce(
    (a, p) => ({ calories: a.calories + p.calories, protein: a.protein + p.protein, carbs: a.carbs + p.carbs, fat: a.fat + p.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return { calories: t.calories, protein: umaCasa(t.protein), carbs: umaCasa(t.carbs), fat: umaCasa(t.fat) };
}

/**
 * Atualização otimista ao marcar/desmarcar (RF13): refaz consumido, restante e a próxima
 * refeição com a mesma regra do backend (RN24). A resposta da API substitui o resultado.
 */
export function recalcularDia(dia: Dia, slot: Slot, done: boolean): Dia {
  const meals = dia.meals.map((m) => (m.slot === slot ? { ...m, done } : m));
  const proxima = dia.isToday ? meals.find((m) => !m.done)?.slot : undefined;
  const planned = dia.totals.planned;
  const consumed = somar(meals.filter((m) => m.done).map((m) => ({ calories: m.calories, ...m.macros })));
  const remaining: Totais = {
    calories: Math.max(0, planned.calories - consumed.calories),
    protein: umaCasa(Math.max(0, planned.protein - consumed.protein)),
    carbs: umaCasa(Math.max(0, planned.carbs - consumed.carbs)),
    fat: umaCasa(Math.max(0, planned.fat - consumed.fat)),
  };

  return {
    ...dia,
    meals: meals.map((m) => ({ ...m, isNext: m.slot === proxima })),
    totals: { planned, consumed, remaining },
  };
}

/** Segunda a domingo da semana de `hojeIso` (YYYY-MM-DD), sem depender do fuso do aparelho. */
export function semanaDe(hojeIso: string): string[] {
  const [a, m, d] = hojeIso.split('-').map(Number);
  const hoje = new Date(Date.UTC(a, m - 1, d));
  const segunda = new Date(hoje);
  segunda.setUTCDate(hoje.getUTCDate() - ((hoje.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(segunda);
    dia.setUTCDate(segunda.getUTCDate() + i);
    return dia.toISOString().slice(0, 10);
  });
}

/** "a, b e c". */
export function juntarComE(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? '';
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

/** O 409 `NO_ACTIVE_PLAN` diz o status do último plano (gerando, falhou ou nenhum). */
export function planoSemAtivo(erro: unknown): { status: StatusDoPlano | null; planId: number | null } | null {
  if (!(erro instanceof ApiError) || erro.code !== 'NO_ACTIVE_PLAN') return null;
  return {
    status: (erro.details.planStatus as StatusDoPlano | null | undefined) ?? null,
    planId: (erro.details.planId as number | null | undefined) ?? null,
  };
}

/** Sem plano ativo: gerando/na fila → "quase pronto"; falhou ou nunca teve → "Tentar de novo". */
export const estadoSemPlano = (status: StatusDoPlano | null): 'gerando' | 'falhou' =>
  status === 'generating' || status === 'pending' ? 'gerando' : 'falhou';
