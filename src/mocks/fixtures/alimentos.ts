/** Resultados de busca como a API devolve (snake_case). */
export const alimentosApi = [
  { id: 12, kind: 'catalog', name: 'Leite integral', measure: 'ml', group: 'laticinio', per_100: { calories: 61, protein: 2.9, carbs: 4.3, fat: 3.2 },
    portion: { amount: 200, text: '200 ml, mais ou menos 1 copo' }, household: { label: 'copo', label_plural: 'copos', amount: 200 }, conflicts: [] },
  { id: 28, kind: 'catalog', name: 'Arroz branco cozido', measure: 'g', group: 'carboidrato', per_100: { calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2 },
    portion: { amount: 150, text: '150 g, mais ou menos 6 colheres de sopa' }, household: { label: 'colher de sopa', label_plural: 'colheres de sopa', amount: 25 }, conflicts: [] },
  { id: 4, kind: 'custom', name: 'Barra de cereal caseira', measure: 'g', group: null, per_100: { calories: 380, protein: 30, carbs: 35, fat: 12 },
    portion: null, household: null, conflicts: [] },
];

export const leiteComLactose = { ...alimentosApi[0], conflicts: ['Intolerância a lactose'] };

export const recentesApi = [{ ...alimentosApi[1], last_amount: 180 }];
