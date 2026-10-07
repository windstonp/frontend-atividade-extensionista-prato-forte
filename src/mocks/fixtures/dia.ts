/** Dia e plano como a API devolve (snake_case) — o dia da Camila do mock (segunda, dia de treino). */

type Item = { food_id: number; name: string; grams: number; amount: string; calories: number; protein: number; carbs: number; fat: number };

const ITENS: Record<string, Item[]> = {
  cafe: [
    { food_id: 2, name: 'Ovos mexidos', grams: 100, amount: '100 g, mais ou menos 2 unidades', calories: 168, protein: 12.9, carbs: 0.6, fat: 12.1 },
    { food_id: 36, name: 'Pão francês', grams: 50, amount: '50 g, mais ou menos 1 unidade', calories: 150, protein: 4, carbs: 29.3, fat: 1.6 },
    { food_id: 41, name: 'Mamão', grams: 150, amount: '150 g, mais ou menos 1 fatia', calories: 60, protein: 0.8, carbs: 15.6, fat: 0.2 },
  ],
  lanche: [
    { food_id: 40, name: 'Banana', grams: 120, amount: '120 g, mais ou menos 2 unidades', calories: 118, protein: 1.6, carbs: 31.2, fat: 0.1 },
    { food_id: 17, name: 'Iogurte natural', grams: 170, amount: '170 g, mais ou menos 1 pote', calories: 87, protein: 7, carbs: 3.2, fat: 5.1 },
  ],
  almoco: [
    { food_id: 28, name: 'Arroz branco cozido', grams: 150, amount: '150 g, mais ou menos 6 colheres de sopa', calories: 192, protein: 3.8, carbs: 42.2, fat: 0.3 },
    { food_id: 21, name: 'Feijão carioca', grams: 86, amount: '86 g, mais ou menos 1 concha', calories: 65, protein: 4.1, carbs: 11.7, fat: 0.4 },
    { food_id: 3, name: 'Frango grelhado', grams: 120, amount: '120 g, mais ou menos 1 filé médio', calories: 191, protein: 38.4, carbs: 0, fat: 3 },
    { food_id: 49, name: 'Salada de alface e tomate', grams: 100, amount: '100 g', calories: 13, protein: 1.1, carbs: 2.4, fat: 0.2 },
  ],
  'pre-treino': [
    { food_id: 30, name: 'Batata-doce cozida', grams: 150, amount: '150 g, mais ou menos 1 unidade média', calories: 116, protein: 0.9, carbs: 27.6, fat: 0.2 },
    { food_id: 40, name: 'Banana', grams: 60, amount: '60 g, mais ou menos 1 unidade', calories: 59, protein: 0.8, carbs: 15.6, fat: 0.1 },
  ],
  jantar: [
    { food_id: 6, name: 'Patinho moído', grams: 120, amount: '120 g, mais ou menos 5 colheres de sopa', calories: 263, protein: 43.1, carbs: 0, fat: 8.8 },
    { food_id: 35, name: 'Cuscuz de milho', grams: 120, amount: '120 g, mais ou menos 2 fatias', calories: 136, protein: 2.6, carbs: 30.4, fat: 0.8 },
    { food_id: 50, name: 'Brócolis no vapor', grams: 80, amount: '80 g, mais ou menos 4 ramos', calories: 20, protein: 1.7, carbs: 3.5, fat: 0.4 },
  ],
};

const REFEICOES = [
  { slot: 'cafe', name: 'Café da manhã', time: '07:00', note: null },
  { slot: 'lanche', name: 'Lanche da manhã', time: '10:00', note: null },
  { slot: 'almoco', name: 'Almoço', time: '12:30', note: null },
  { slot: 'pre-treino', name: 'Pré-treino', time: '17:30', note: null },
  { slot: 'jantar', name: 'Jantar', time: '20:30', note: 'Depois do treino das 19h' },
] as const;

const umaCasa = (n: number) => Math.round(n * 10) / 10;

export type RegistroApi = {
  id: number; food_id: number | null; custom_food_id: number | null; suggestion_item_id: number | null;
  name: string; amount: number; measure: 'g' | 'ml'; amount_text: string; calories: number;
  macros: { protein: number; carbs: number; fat: number }; conflicts: string[];
};

type ItemApi = ReturnType<typeof itensDe>[number];

function itensDe(slot: string, i: number) {
  return ITENS[slot].map((it, j) => ({
    id: 5000 + i * 10 + j,
    food_id: it.food_id,
    name: it.name,
    grams: it.grams,
    measure: 'g' as 'g' | 'ml',
    amount: it.amount,
    calories: it.calories,
    macros: { protein: it.protein, carbs: it.carbs, fat: it.fat },
    source: 'plan',
    replaced_from: null as string | null,
    registered: false,
  }));
}

/** Registro igual a um item sugerido (o "+"). */
export function registroDaSugestao(item: ItemApi, id = 7000 + item.id): RegistroApi {
  return { id, food_id: item.food_id, custom_food_id: null, suggestion_item_id: item.id, name: item.name, amount: item.grams,
    measure: item.measure, amount_text: item.amount, calories: item.calories, macros: item.macros, conflicts: [] };
}

type T = { calories: number; protein: number; carbs: number; fat: number };
const somarT = (partes: T[]): T => ({
  calories: partes.reduce((s, p) => s + p.calories, 0),
  protein: umaCasa(partes.reduce((s, p) => s + p.protein, 0)),
  carbs: umaCasa(partes.reduce((s, p) => s + p.carbs, 0)),
  fat: umaCasa(partes.reduce((s, p) => s + p.fat, 0)),
});

/** Espelho do RN48 só para os fixtures (os mocks não importam código de produção). */
function situacao(meta: T, c: T) {
  const calories = c.calories * 10 < meta.calories * 9 ? 'below' : c.calories * 10 > meta.calories * 11 ? 'above' : 'ok';
  const protein = umaCasa(c.protein * 10) >= umaCasa(meta.protein * 9) ? 'ok' : 'below';
  const fat = umaCasa(c.fat * 10) <= umaCasa(meta.fat * 11) ? 'ok' : 'above';
  return { status: { calories, protein, fat }, goal_met: calories !== 'below' && protein === 'ok' };
}

/** Uma refeição como a API devolve; `feita` sem `registros` = registrou a sugestão inteira. */
export function refeicaoApi(slot: string, i: number, feita: boolean, proxima: boolean, registros?: RegistroApi[]) {
  const base = REFEICOES.find((r) => r.slot === slot)!;
  const itens = itensDe(slot, i);
  const entries = registros ?? (feita ? itens.map((it) => registroDaSugestao(it)) : []);
  const ligados = new Set(entries.map((e) => e.suggestion_item_id));
  const meta = somarT(itens.map((it) => ({ calories: it.calories, ...it.macros })));
  const consumed = somarT(entries.map((e) => ({ calories: e.calories, ...e.macros })));
  const sit = entries.length > 0 ? situacao(meta, consumed) : null;
  return {
    id: 900 + i,
    ...base,
    position: i + 1,
    done: entries.length > 0,
    is_next: proxima,
    summary: itens.map((it, j) => (j === 0 ? it.name : it.name.toLowerCase())).join(', ').replace(/, ([^,]*)$/, ' e $1'),
    calories: meta.calories,
    macros: { protein: meta.protein, carbs: meta.carbs, fat: meta.fat },
    consumed,
    status: sit?.status ?? null,
    goal_met: sit?.goal_met ?? false,
    items: itens.map((it) => ({ ...it, registered: ligados.has(it.id) })),
    entries,
  };
}

/** `GET /days/{data}` com o que o teste quiser registrado. */
export function diaApi(parcial: {
  feitas?: string[]; registros?: Partial<Record<string, RegistroApi[]>>; data?: string; hoje?: boolean; editavel?: boolean;
  ultimaAlteracao?: { id: number; text: string };
} = {}) {
  const feitas = parcial.feitas ?? [];
  const registros = parcial.registros ?? {};
  const hoje = parcial.hoje ?? true;
  const comRegistro = (slot: string) => feitas.includes(slot) || (registros[slot]?.length ?? 0) > 0;
  const proxima = hoje ? REFEICOES.find((r) => !comRegistro(r.slot))?.slot : undefined;
  const meals = REFEICOES.map((r, i) => refeicaoApi(r.slot, i, feitas.includes(r.slot), r.slot === proxima, registros[r.slot]));
  const planned = somarT(meals.map((m) => ({ calories: m.calories, ...m.macros })));
  const consumed = somarT(meals.map((m) => m.consumed));
  return {
    date: parcial.data ?? '2026-09-28',
    is_today: hoje,
    editable: parcial.editavel ?? hoje,
    materialized: hoje,
    is_training_day: true,
    targets: { kcal: 2250, protein_g: 115, carbs_g: 305, fat_g: 65 },
    totals: {
      planned,
      consumed,
      remaining: {
        calories: Math.max(0, planned.calories - consumed.calories),
        protein: umaCasa(Math.max(0, planned.protein - consumed.protein)),
        carbs: umaCasa(Math.max(0, planned.carbs - consumed.carbs)),
        fat: umaCasa(Math.max(0, planned.fat - consumed.fat)),
      },
    },
    meals,
    last_change: parcial.ultimaAlteracao ? { ...parcial.ultimaAlteracao, undo_until: '2026-09-28T11:15:00-03:00' } : null,
  };
}

export const substituicoesApi = {
  item: { id: 5020, name: 'Arroz branco cozido', amount: '150 g, mais ou menos 6 colheres de sopa', calories: 192, macros: { protein: 3.8, carbs: 42.2, fat: 0.3 } },
  options: [
    { food_id: 30, name: 'Batata-doce cozida', grams: 230, amount: '230 g, mais ou menos 1,5 unidades médias', calories: 177, macros: { protein: 1.4, carbs: 42.3, fat: 0.2 }, calorie_delta: -15, note: 'Energia que dura até o treino', in_pantry: true },
    { food_id: 33, name: 'Tapioca', grams: 70, amount: '70 g, mais ou menos 1 tapioca média', calories: 168, macros: { protein: 0, carbs: 42, fat: 0 }, calorie_delta: -24, note: 'Sem glúten e pronta em 3 minutos', in_pantry: true },
    { food_id: 29, name: 'Arroz integral', grams: 165, amount: '165 g, mais ou menos 6,5 colheres de sopa', calories: 205, macros: { protein: 4.3, carbs: 42.6, fat: 1.7 }, calorie_delta: 13, note: 'Mais fibra segura a fome até o treino', in_pantry: false },
  ],
  guarantee: { restrictions: ['Amendoim e castanhas'] },
};

export function planoProntoApi(id: number) {
  return {
    id,
    status: 'ready',
    is_active: true,
    ready_at: '2026-09-28T10:05:12-03:00',
    targets: { kcal: 2250, protein_g: 115, carbs_g: 305, fat_g: 65 },
    meals: REFEICOES.map((r, i) => {
      const m = refeicaoApi(r.slot, i, false, false);
      return { slot: m.slot, name: m.name, time: m.time, calories: m.calories, summary: m.summary };
    }),
    rating: null,
  };
}
