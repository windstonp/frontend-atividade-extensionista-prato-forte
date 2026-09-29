/** Respostas da API (snake_case) para stories e testes — espelham os seeders e a Camila do mock. */

export const catalogoApi = {
  goals: [
    { value: 'ganhar-massa', label: 'Ganhar massa magra', description: 'Comer um pouco acima do gasto, com proteína alta todo dia.' },
    { value: 'perder-gordura', label: 'Perder gordura', description: 'Déficit leve, mantendo a força nos treinos.' },
    { value: 'manter-peso', label: 'Manter o peso', description: 'Organizar os horários e equilibrar o que você já come.' },
    { value: 'mais-disposicao', label: 'Ter mais disposição', description: 'Energia para o treino sem chegar arrastada no fim do dia.' },
  ],
  activity_levels: [
    { value: 'parado', label: 'Quase não treino', description: 'Menos de um treino por semana.' },
    { value: 'leve', label: '1 ou 2 vezes na semana', description: 'Musculação leve ou caminhada.' },
    { value: 'moderado', label: '3 ou 4 vezes na semana', description: 'O ritmo da maior parte do pessoal da Zfit.' },
    { value: 'intenso', label: '5 ou 6 vezes na semana', description: 'Treino puxado quase todo dia.' },
  ],
  work_postures: [
    { value: 'sentada', label: 'Sentada' },
    { value: 'em-pe', label: 'Em pé' },
    { value: 'peso-pesado', label: 'Peso pesado' },
  ],
  restrictions: [
    { slug: 'lactose', label: 'Intolerância a lactose', is_allergy: false },
    { slug: 'gluten', label: 'Glúten', is_allergy: false },
    { slug: 'castanhas', label: 'Amendoim e castanhas', is_allergy: true },
    { slug: 'frutos-do-mar', label: 'Frutos do mar', is_allergy: true },
    { slug: 'sem-carne', label: 'Não como carne', is_allergy: false },
    { slug: 'sem-animal', label: 'Não como nada de origem animal', is_allergy: false },
  ],
  pantry: [
    {
      category: 'proteinas',
      label: 'Proteínas',
      items: [
        { slug: 'ovos', label: 'Ovos' },
        { slug: 'frango', label: 'Frango' },
        { slug: 'carne-moida', label: 'Carne moída' },
        { slug: 'peixe', label: 'Peixe' },
        { slug: 'iogurte', label: 'Iogurte' },
        { slug: 'queijo', label: 'Queijo' },
      ],
    },
    {
      category: 'carboidratos',
      label: 'Carboidratos',
      items: [
        { slug: 'arroz-e-feijao', label: 'Arroz e feijão' },
        { slug: 'batata-doce', label: 'Batata-doce' },
        { slug: 'tapioca', label: 'Tapioca' },
        { slug: 'macarrao', label: 'Macarrão' },
        { slug: 'cuscuz', label: 'Cuscuz' },
        { slug: 'pao-frances', label: 'Pão francês' },
        { slug: 'aveia', label: 'Aveia' },
      ],
    },
    {
      category: 'frutas',
      label: 'Frutas',
      items: [
        { slug: 'banana', label: 'Banana' },
        { slug: 'mamao', label: 'Mamão' },
        { slug: 'maca', label: 'Maçã' },
        { slug: 'laranja', label: 'Laranja' },
      ],
    },
  ],
  dislike_options: [
    { id: 91, name: 'Berinjela' },
    { id: 92, name: 'Beterraba' },
    { id: 88, name: 'Fígado bovino' },
    { id: 93, name: 'Jiló' },
    { id: 94, name: 'Peixe assado' },
  ],
  lunch_places: [
    { value: 'casa', label: 'Em casa' },
    { value: 'marmita', label: 'Marmita no trabalho' },
    { value: 'restaurante', label: 'Restaurante' },
  ],
};

export interface RespostasApi {
  goal: string | null;
  preferred_name: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  sex: string | null;
  goal_weight_kg: number | null;
  goal_weight_source: string | null;
  activity_level: string | null;
  work_posture: string | null;
  pantry_items: string[];
  restrictions: string[];
  other_restrictions: string[];
  wake_time: string | null;
  training_time: string | null;
  sleep_time: string | null;
  training_days: number[];
  lunch_place: string | null;
}

export const respostasVazias: RespostasApi = {
  goal: null,
  preferred_name: 'Camila',
  age: null,
  height_cm: null,
  weight_kg: null,
  sex: null,
  goal_weight_kg: null,
  goal_weight_source: null,
  activity_level: null,
  work_posture: null,
  pantry_items: [],
  restrictions: [],
  other_restrictions: [],
  wake_time: null,
  training_time: null,
  sleep_time: null,
  training_days: [],
  lunch_place: null,
};

export const respostasDaCamila: RespostasApi = {
  goal: 'ganhar-massa',
  preferred_name: 'Camila',
  age: 27,
  height_cm: 164,
  weight_kg: 58.4,
  sex: 'feminino',
  goal_weight_kg: 62,
  goal_weight_source: 'user',
  activity_level: 'moderado',
  work_posture: 'sentada',
  pantry_items: ['ovos', 'frango', 'arroz-e-feijao'],
  restrictions: ['castanhas'],
  other_restrictions: ['camarão'],
  wake_time: '06:20',
  training_time: '19:00',
  sleep_time: '23:00',
  training_days: [1, 3, 5],
  lunch_place: 'marmita',
};

/** `GET /onboarding` com o que o teste quiser trocar. */
export function onboardingApi(
  parcial: { completed_steps?: string[]; next_step?: string | null; answers?: Partial<RespostasApi> } = {},
) {
  const answers = { ...respostasVazias, ...parcial.answers };
  return {
    completed: false,
    completed_steps: parcial.completed_steps ?? [],
    next_step: parcial.next_step === undefined ? 'objetivo' : parcial.next_step,
    answers,
    healthy_weight_range: answers.height_cm === 164 ? { min: 49.8, max: 67.0 } : null,
  };
}

export const previaApi = { kcal: 2250, protein_g: 115, carbs_g: 305, fat_g: 65, meals: 5 };

export const perfilApi = {
  name: 'Camila Réus',
  preferred_name: 'Camila',
  email: 'camila.reus@gmail.com',
  created_at: '2026-08-11T09:00:00-03:00',
  goal: 'ganhar-massa',
  sex: 'feminino',
  age: 27,
  height_cm: 164,
  start_weight_kg: 56.8,
  current_weight_kg: 58.4,
  goal_weight_kg: 62,
  goal_weight_source: 'user',
  healthy_weight_range: { min: 49.8, max: 67.0 },
  activity_level: 'moderado',
  work_posture: 'sentada',
  wake_time: '06:20',
  training_time: '19:00',
  sleep_time: '23:00',
  training_days: [1, 3, 5],
  lunch_place: 'marmita',
  pantry_items: [
    { slug: 'ovos', label: 'Ovos' },
    { slug: 'frango', label: 'Frango' },
    { slug: 'arroz-e-feijao', label: 'Arroz e feijão' },
  ],
  restrictions: [{ slug: 'castanhas', label: 'Amendoim e castanhas', is_allergy: true }],
  other_restrictions: ['camarão'],
  disliked_foods: [{ id: 88, name: 'Fígado bovino' }],
  gym: 'Zfit',
  city: 'Capivari de Baixo',
};
