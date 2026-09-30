/** A evolução da Camila como a API devolve (snake_case), ancorada em 2026-09-15 (as 6 pesagens do mock). */

export const PADRAO_28_DIAS = [
  'completo', 'completo', 'parcial', 'completo', 'completo', 'vazio', 'completo',
  'completo', 'parcial', 'completo', 'completo', 'completo', 'completo', 'vazio',
  'completo', 'completo', 'completo', 'parcial', 'completo', 'completo', 'completo',
  'completo', 'completo', 'vazio', 'completo', 'completo', 'completo', 'hoje',
] as const;

const PONTOS = [
  ['2026-08-11', 56.8], ['2026-08-18', 57.0], ['2026-08-25', 57.5], ['2026-09-01', 57.6], ['2026-09-08', 58.0], ['2026-09-15', 58.4],
] as const;

export const pesagensApi = PONTOS.map(([date, weight_kg], i) => ({ id: i + 1, date, weight_kg }));

type Parcial = { pontos?: readonly (readonly [string, number])[]; meta?: number | null; previsao?: boolean; semMedias?: boolean };

export function progressoApi(parcial: Parcial = {}) {
  const pontos = parcial.pontos ?? PONTOS;
  const meta = parcial.meta === undefined ? 62 : parcial.meta;
  const primeiro = pontos[0];
  const ultimo = pontos.at(-1);
  return {
    period: '6w',
    weight: {
      start_kg: primeiro?.[1] ?? null,
      current_kg: ultimo?.[1] ?? null,
      goal_kg: meta,
      goal_source: meta === null ? null : 'user',
      change_kg: ultimo ? Math.round((ultimo[1] - primeiro![1]) * 10) / 10 : null,
      span_weeks: ultimo ? Math.round((Date.parse(ultimo[0]) - Date.parse(primeiro![0])) / (7 * 86_400_000)) : null,
      points: pontos.map(([date, weight_kg]) => ({ date, weight_kg })),
      forecast: (parcial.previsao ?? true) && meta !== null ? { date: '2026-12-05', label: 'início de dezembro' } : null,
    },
    adherence: {
      days: PADRAO_28_DIAS.map((status, i) => ({ date: new Date(Date.UTC(2026, 7, 19 + i)).toISOString().slice(0, 10), status })),
      complete_days: 21,
      streak: 3,
    },
    averages: parcial.semMedias
      ? { days_counted: 0, protein: { avg_g: null, target_g: 115 }, calories: { avg_kcal: null, target_kcal: 2250 }, insight: null }
      : {
          days_counted: 26,
          protein: { avg_g: 112, target_g: 115 },
          calories: { avg_kcal: 1870, target_kcal: 2250 },
          insight: 'Você fica um pouco abaixo da meta de proteína nos dias sem treino.',
        },
  };
}
