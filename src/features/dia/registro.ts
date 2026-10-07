import type { AlimentoBusca, Dia, Registro, RefeicaoDoDia, Slot, StatusDaMeta, Totais } from './tipos';

const umaCasa = (n: number) => Math.round(n * 10) / 10;

export const metaDaRefeicao = (r: RefeicaoDoDia): Totais => ({ calories: r.calories, ...r.macros });

/** RN48 — mesma conta do backend (MealGoalStatus), para o otimismo. */
export function statusDaMeta(meta: Totais, consumido: Totais): { status: StatusDaMeta; goalMet: boolean } {
  const calories = consumido.calories * 10 < meta.calories * 9 ? 'below' : consumido.calories * 10 > meta.calories * 11 ? 'above' : 'ok';
  const protein = umaCasa(consumido.protein * 10) >= umaCasa(meta.protein * 9) ? 'ok' : 'below';
  const fat = umaCasa(consumido.fat * 10) <= umaCasa(meta.fat * 11) ? 'ok' : 'above';
  return { status: { calories, protein, fat }, goalMet: calories !== 'below' && protein === 'ok' };
}

/** RN48 — a frase da régua. */
export function fraseDaMeta(meta: Totais, consumido: Totais, temRegistro: boolean): string {
  if (!temRegistro) return 'Nada registrado ainda.';
  const { status, goalMet } = statusDaMeta(meta, consumido);
  if (goalMet) {
    const notas = ['Meta batida.'];
    if (status.calories === 'above') notas.push(`${Math.round(consumido.calories - meta.calories)} kcal acima da sugestão.`);
    if (status.fat === 'above') notas.push(`${Math.round(consumido.fat - meta.fat)} g de gordura acima da sugestão.`);
    return notas.join(' ');
  }
  const faltas: string[] = [];
  if (status.calories === 'below') faltas.push(`${Math.round(meta.calories - consumido.calories)} kcal`);
  if (status.protein === 'below') faltas.push(`${Math.round(meta.protein - consumido.protein)} g de proteína`);
  return `Faltam ${faltas.join(' e ')}.`;
}

const numero = (n: number) => (Number.isInteger(n) ? String(n) : String(n).replace('.', ','));

/** Atalhos da folha: medida caseira (1 e 2) e meia porção; sem repetir quantidade. */
export function atalhosDeQuantidade(a: AlimentoBusca): { rotulo: string; amount: number }[] {
  const lista: { rotulo: string; amount: number }[] = [];
  const mais = (rotulo: string, amount: number) => {
    if (amount > 0 && amount <= 2000 && !lista.some((x) => x.amount === amount)) lista.push({ rotulo, amount });
  };
  if (a.household) {
    mais(`1 ${a.household.label} · ${numero(a.household.amount)} ${a.measure}`, a.household.amount);
    mais(`2 ${a.household.labelPlural ?? a.household.label} · ${numero(a.household.amount * 2)} ${a.measure}`, a.household.amount * 2);
  }
  if (a.portion) {
    mais(`½ porção · ${numero(a.portion.amount / 2)} ${a.measure}`, a.portion.amount / 2);
    mais(`1 porção · ${numero(a.portion.amount)} ${a.measure}`, a.portion.amount);
  }
  if (a.lastAmount) mais(`Como da última vez · ${numero(a.lastAmount)} ${a.measure}`, a.lastAmount);
  return lista;
}

export const previa = (per100: Totais, amount: number): Totais => ({
  calories: Math.round((per100.calories * amount) / 100),
  protein: umaCasa((per100.protein * amount) / 100),
  carbs: umaCasa((per100.carbs * amount) / 100),
  fat: umaCasa((per100.fat * amount) / 100),
});

/** Para editar a quantidade sem buscar o alimento: os valores por 100 saem do próprio retrato. */
export const per100DoRegistro = (r: Registro): Totais => ({
  calories: (r.calories * 100) / r.amount, protein: (r.macros.protein * 100) / r.amount,
  carbs: (r.macros.carbs * 100) / r.amount, fat: (r.macros.fat * 100) / r.amount,
});

/** "150,5" → 150.5; vazio, ≤ 0, > 2000 ou mais de 1 casa → null. */
export function lerQuantidade(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.');
  if (!/^\d+(\.\d)?$/.test(limpo)) return null;
  const n = Number(limpo);
  return n > 0 && n <= 2000 ? n : null;
}

function somar(partes: Totais[]): Totais {
  const t = partes.reduce((a, p) => ({ calories: a.calories + p.calories, protein: a.protein + p.protein, carbs: a.carbs + p.carbs, fat: a.fat + p.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 });
  return { calories: t.calories, protein: umaCasa(t.protein), carbs: umaCasa(t.carbs), fat: umaCasa(t.fat) };
}

/** Otimismo do "+": registra os itens sugeridos com id provisório negativo; a resposta da API substitui. */
export function registrarSugestaoOtimista(dia: Dia, slot: Slot, itemIds: number[]): Dia {
  let provisorio = -Date.now();
  const meals = dia.meals.map((m) => {
    if (m.slot !== slot) return m;
    const novos: Registro[] = m.items
      .filter((i) => i.id !== null && itemIds.includes(i.id) && !i.registered)
      .map((i) => ({ id: provisorio--, foodId: i.foodId, customFoodId: null, suggestionItemId: i.id, name: i.name, amount: i.grams,
        measure: i.measure, amountText: i.amount, calories: i.calories, macros: i.macros, conflicts: [] }));
    const entries = [...m.entries, ...novos];
    const consumed = somar(entries.map((e) => ({ calories: e.calories, ...e.macros })));
    const { status, goalMet } = statusDaMeta(metaDaRefeicao(m), consumed);
    return { ...m, entries, consumed, status, goalMet, done: entries.length > 0,
      items: m.items.map((i) => (i.id !== null && itemIds.includes(i.id) ? { ...i, registered: true } : i)) };
  });
  const proxima = dia.isToday ? meals.find((m) => !m.done)?.slot : undefined;
  const consumed = somar(meals.map((m) => m.consumed));
  const planned = dia.totals.planned;
  return {
    ...dia,
    meals: meals.map((m) => ({ ...m, isNext: m.slot === proxima })),
    totals: { planned, consumed, remaining: {
      calories: Math.max(0, planned.calories - consumed.calories), protein: umaCasa(Math.max(0, planned.protein - consumed.protein)),
      carbs: umaCasa(Math.max(0, planned.carbs - consumed.carbs)), fat: umaCasa(Math.max(0, planned.fat - consumed.fat)) } },
  };
}
