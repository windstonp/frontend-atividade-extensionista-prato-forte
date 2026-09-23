import type { DayPlan, Macros, Meal } from "./types";

const zero: Macros = { protein: 0, carbs: 0, fat: 0 };

export function somaMacros(a: Macros, b: Macros): Macros {
  return {
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

export function totaisDaRefeicao(meal: Meal) {
  return meal.items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      macros: somaMacros(acc.macros, item.macros),
    }),
    { calories: 0, macros: zero },
  );
}

export function totaisDoDia(plan: DayPlan) {
  return plan.meals.reduce(
    (acc, meal) => {
      const t = totaisDaRefeicao(meal);
      return { calories: acc.calories + t.calories, macros: somaMacros(acc.macros, t.macros) };
    },
    { calories: 0, macros: zero },
  );
}

export function totaisConsumidos(plan: DayPlan) {
  return plan.meals
    .filter((m) => m.done)
    .reduce(
      (acc, meal) => {
        const t = totaisDaRefeicao(meal);
        return { calories: acc.calories + t.calories, macros: somaMacros(acc.macros, t.macros) };
      },
      { calories: 0, macros: zero },
    );
}

export function proximaRefeicao(plan: DayPlan): Meal | undefined {
  return plan.meals.find((m) => !m.done);
}

export function refeicoesFeitas(plan: DayPlan) {
  return plan.meals.filter((m) => m.done).length;
}
