import type {
  DayAdherence,
  DayPlan,
  FoodItem,
  NutriSuggestion,
  Profile,
  Substitution,
  WeighIn,
} from "./types";

/**
 * Dados fictícios de uma aluna da Zfit. Servem para validar a experiência
 * enquanto as entidades de nutrição não existem no backend.
 */

export const mockProfile: Profile = {
  name: "Camila Réus",
  initials: "CR",
  email: "camila.reus@gmail.com",
  age: 27,
  heightCm: 164,
  weightKg: 58.4,
  startWeightKg: 56.8,
  goalWeightKg: 62,
  goal: "ganhar-massa",
  activity: "moderado",
  workPosture: "sentada",
  trainingTime: "19:00",
  trainingDays: [1, 3, 5],
  wakeTime: "06:20",
  sleepTime: "23:00",
  lunchPlace: "marmita",
  gym: "Zfit",
  city: "Capivari de Baixo",
  memberSince: "agosto",
  pantry: [
    "Ovos",
    "Frango",
    "Carne moída",
    "Iogurte",
    "Queijo",
    "Arroz e feijão",
    "Batata-doce",
    "Tapioca",
    "Pão francês",
    "Aveia",
    "Banana",
    "Mamão",
  ],
  dislikes: ["Fígado", "Jiló"],
  restrictions: [
    { id: "castanhas", label: "Amendoim e castanhas", allergy: true },
  ],
};

const cafe: FoodItem[] = [
  {
    id: "ovos-mexidos",
    name: "Ovos mexidos",
    amount: "3 unidades",
    calories: 230,
    macros: { protein: 19, carbs: 2, fat: 16 },
  },
  {
    id: "pao-frances",
    name: "Pão francês",
    amount: "1 unidade, 50 g",
    calories: 140,
    macros: { protein: 4, carbs: 29, fat: 1 },
  },
  {
    id: "mamao",
    name: "Mamão",
    amount: "120 g, meia fatia",
    calories: 55,
    macros: { protein: 0.6, carbs: 14, fat: 0.2 },
  },
  {
    id: "cafe-preto",
    name: "Café sem açúcar",
    amount: "1 xícara",
    calories: 5,
    macros: { protein: 0, carbs: 1, fat: 0 },
  },
];

const lanche: FoodItem[] = [
  {
    id: "iogurte",
    name: "Iogurte natural",
    amount: "170 g, um pote",
    calories: 105,
    macros: { protein: 6, carbs: 8, fat: 5 },
  },
  {
    id: "banana",
    name: "Banana",
    amount: "1 unidade média",
    calories: 90,
    macros: { protein: 1, carbs: 23, fat: 0.3 },
  },
  {
    id: "aveia",
    name: "Aveia em flocos",
    amount: "20 g, 2 colheres de sopa",
    calories: 75,
    macros: { protein: 2.7, carbs: 13, fat: 1.4 },
  },
];

const almoco: FoodItem[] = [
  {
    id: "arroz-branco",
    name: "Arroz branco cozido",
    amount: "150 g, mais ou menos 5 colheres de sopa",
    calories: 195,
    macros: { protein: 3.5, carbs: 42, fat: 0.4 },
  },
  {
    id: "feijao",
    name: "Feijão carioca",
    amount: "80 g, uma concha média",
    calories: 60,
    macros: { protein: 4, carbs: 11, fat: 0.4 },
  },
  {
    id: "frango-grelhado",
    name: "Frango grelhado",
    amount: "150 g, um filé grande",
    calories: 240,
    macros: { protein: 45, carbs: 0, fat: 5 },
  },
  {
    id: "salada",
    name: "Salada de alface e tomate",
    amount: "Um prato de sobremesa cheio",
    calories: 25,
    macros: { protein: 1, carbs: 5, fat: 0.2 },
  },
  {
    id: "azeite",
    name: "Azeite de oliva",
    amount: "1 colher de sopa, na salada",
    calories: 108,
    macros: { protein: 0, carbs: 0, fat: 12 },
  },
];

const preTreino: FoodItem[] = [
  {
    id: "tapioca",
    name: "Tapioca",
    amount: "2 colheres de sopa de goma",
    calories: 120,
    macros: { protein: 0, carbs: 30, fat: 0 },
  },
  {
    id: "queijo-minas",
    name: "Queijo minas",
    amount: "40 g, duas fatias",
    calories: 105,
    macros: { protein: 7, carbs: 1, fat: 8 },
  },
];

const jantar: FoodItem[] = [
  {
    id: "batata-doce-jantar",
    name: "Batata-doce cozida",
    amount: "200 g, dois pedaços",
    calories: 155,
    macros: { protein: 3, carbs: 36, fat: 0.2 },
  },
  {
    id: "patinho",
    name: "Patinho moído",
    amount: "120 g",
    calories: 205,
    macros: { protein: 32, carbs: 0, fat: 8 },
  },
  {
    id: "brocolis",
    name: "Brócolis no vapor",
    amount: "100 g",
    calories: 30,
    macros: { protein: 3, carbs: 6, fat: 0.4 },
  },
];

export const mockDayPlan: DayPlan = {
  date: "2026-09-21",
  targetCalories: 1950,
  targetMacros: { protein: 120, carbs: 230, fat: 55 },
  meals: [
    {
      id: "cafe",
      slot: "cafe",
      name: "Café da manhã",
      time: "07:00",
      summary: "Ovos mexidos, pão francês, mamão e café",
      items: cafe,
      done: true,
    },
    {
      id: "lanche",
      slot: "lanche",
      name: "Lanche da manhã",
      time: "10:00",
      summary: "Iogurte natural, banana e aveia",
      items: lanche,
      done: true,
    },
    {
      id: "almoco",
      slot: "almoco",
      name: "Almoço",
      time: "12:30",
      summary: "Arroz, feijão, frango grelhado, salada e azeite",
      items: almoco,
      done: false,
    },
    {
      id: "pre-treino",
      slot: "pre-treino",
      name: "Pré-treino",
      time: "17:30",
      summary: "Tapioca com queijo minas",
      items: preTreino,
      done: false,
    },
    {
      id: "jantar",
      slot: "jantar",
      name: "Jantar",
      time: "20:30",
      summary: "Batata-doce, patinho moído e brócolis no vapor",
      items: jantar,
      done: false,
      note: "Depois do treino das 19h",
    },
  ],
};

/** Trocas por alimento. A chave é o id do alimento que sai. */
export const mockSubstitutions: Record<string, Substitution[]> = {
  "arroz-branco": [
    {
      id: "batata-doce",
      name: "Batata-doce cozida",
      amount: "180 g, dois pedaços médios",
      calories: 140,
      macros: { protein: 2, carbs: 33, fat: 0.2 },
      note: "Mais fibra, segura a fome até o treino",
    },
    {
      id: "arroz-integral",
      name: "Arroz integral",
      amount: "150 g, 5 colheres de sopa",
      calories: 185,
      macros: { protein: 4, carbs: 38, fat: 1.4 },
      note: "Energia liberada mais devagar",
    },
    {
      id: "macarrao",
      name: "Macarrão parafuso",
      amount: "120 g já cozido",
      calories: 190,
      macros: { protein: 6, carbs: 40, fat: 0.9 },
      note: "Combina com o molho de tomate que você já faz",
    },
    {
      id: "cuscuz",
      name: "Cuscuz de milho",
      amount: "120 g, um pedaço da forma",
      calories: 200,
      macros: { protein: 4, carbs: 44, fat: 0.6 },
      note: "Pronto em cinco minutos",
    },
  ],
  "frango-grelhado": [
    {
      id: "patinho-almoco",
      name: "Patinho moído",
      amount: "140 g",
      calories: 240,
      macros: { protein: 37, carbs: 0, fat: 10 },
      note: "Mesma proteína, um pouco mais de gordura",
    },
    {
      id: "ovos-almoco",
      name: "Ovos cozidos",
      amount: "4 unidades",
      calories: 285,
      macros: { protein: 25, carbs: 2, fat: 20 },
      note: "Resolve quando não sobrou carne na geladeira",
    },
    {
      id: "atum",
      name: "Atum em lata, na água",
      amount: "1 lata de 170 g escorrida",
      calories: 190,
      macros: { protein: 42, carbs: 0, fat: 2 },
      note: "Vai direto na marmita, sem esquentar",
    },
  ],
};

export const mockWeighIns: WeighIn[] = [
  { date: "2026-08-11", weightKg: 56.8 },
  { date: "2026-08-18", weightKg: 57.0 },
  { date: "2026-08-25", weightKg: 57.5 },
  { date: "2026-09-01", weightKg: 57.6 },
  { date: "2026-09-08", weightKg: 58.0 },
  { date: "2026-09-15", weightKg: 58.4 },
];

const padrao: DayAdherence["status"][] = [
  "completo", "completo", "parcial", "completo", "completo", "vazio", "completo",
  "completo", "parcial", "completo", "completo", "completo", "completo", "vazio",
  "completo", "completo", "completo", "parcial", "completo", "completo", "completo",
  "completo", "completo", "vazio", "completo", "completo", "completo", "hoje",
];

export const mockAdherence: DayAdherence[] = padrao.map((status, i) => {
  const d = new Date("2026-08-25T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + i);
  return { date: d.toISOString().slice(0, 10), status };
});

export const mockSuggestions: NutriSuggestion[] = [
  { id: "trocar-arroz", question: "Posso trocar o arroz por batata?" },
  { id: "sem-frango", question: "Não tenho frango em casa. O que uso no lugar?" },
  { id: "pre-treino", question: "O que comer antes do treino das 19h?" },
  { id: "montar-jantar", question: "Monte um jantar com ovo, batata-doce e brócolis" },
];
