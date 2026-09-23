/**
 * Modelo de domínio do Prato Forte.
 *
 * O backend de hoje só tem contas (`users`, `sessions`) e o chat de IA
 * (`chats`, `messages`). Tudo que está aqui em volta de nutrição ainda
 * precisa virar entidade no backend — estes tipos são a forma que o
 * frontend espera receber.
 */

export type Goal =
  | "ganhar-massa"
  | "perder-gordura"
  | "manter-peso"
  | "mais-disposicao";

export type ActivityLevel = "parado" | "leve" | "moderado" | "intenso";

export type MealSlot = "cafe" | "lanche" | "almoco" | "pre-treino" | "jantar";

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  /** Porção em linguagem de cozinha: "150 g, mais ou menos 5 colheres de sopa" */
  amount: string;
  calories: number;
  macros: Macros;
  /** Preenchido quando o alimento entrou no lugar de outro */
  replacedFrom?: string;
}

export interface Meal {
  id: string;
  slot: MealSlot;
  name: string;
  /** "12:30" */
  time: string;
  summary: string;
  items: FoodItem[];
  done: boolean;
  /** Recado curto ligado à rotina, ex.: "Depois do treino das 19h" */
  note?: string;
}

export interface DayPlan {
  date: string;
  targetCalories: number;
  targetMacros: Macros;
  meals: Meal[];
}

export interface Restriction {
  id: string;
  label: string;
  /** Alergia nunca pode aparecer, nem em substituição */
  allergy: boolean;
}

export interface Profile {
  name: string;
  initials: string;
  email: string;
  age: number;
  heightCm: number;
  weightKg: number;
  startWeightKg: number;
  goalWeightKg: number;
  goal: Goal;
  activity: ActivityLevel;
  workPosture: "sentada" | "em-pe" | "peso-pesado";
  trainingTime: string;
  /** 0 = domingo */
  trainingDays: number[];
  wakeTime: string;
  sleepTime: string;
  lunchPlace: "casa" | "marmita" | "restaurante";
  gym: string;
  city: string;
  memberSince: string;
  pantry: string[];
  dislikes: string[];
  restrictions: Restriction[];
}

export interface Substitution {
  id: string;
  name: string;
  amount: string;
  calories: number;
  macros: Macros;
  /** Por que essa troca faz sentido para esta pessoa */
  note: string;
}

export interface WeighIn {
  /** ISO, só a data */
  date: string;
  weightKg: number;
}

export type AdherenceStatus = "completo" | "parcial" | "vazio" | "hoje";

export interface DayAdherence {
  date: string;
  status: AdherenceStatus;
}

/** Ação que o Nutri devolve junto da resposta e o app sabe executar */
export type NutriAction =
  | { kind: "substituir"; mealId: string; foodId: string; substitutionId: string; label: string }
  | { kind: "aplicar-refeicao"; mealId: string; label: string }
  | { kind: "outra-opcao"; label: string }
  | { kind: "ver-refeicao"; mealId: string; label: string }
  | { kind: "dispensar"; label: string };

export interface SwapCard {
  fromName: string;
  fromAmount: string;
  fromCalories: number;
  toName: string;
  toAmount: string;
  toCalories: number;
  carbsBefore: number;
  carbsAfter: number;
  calorieDelta: number;
}

export interface MealCard {
  title: string;
  time: string;
  calories: number;
  macros: Macros;
  items: { name: string; amount: string; calories: number }[];
  warning?: string;
}

export interface NutriMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Segundo parágrafo, depois do cartão */
  followUp?: string;
  swap?: SwapCard;
  meal?: MealCard;
  actions?: NutriAction[];
  status?: "enviando" | "falhou";
}

export interface NutriSuggestion {
  id: string;
  question: string;
}

/** O que o Nutri enxerga do usuário no momento da pergunta */
export interface NutriContext {
  lines: { text: string; tone: "gema" | "alerta" | "mata" }[];
}

export interface OnboardingAnswers {
  goal: Goal;
  name: string;
  age: string;
  heightCm: string;
  weightKg: string;
  sex: "feminino" | "masculino" | "nao-dizer";
  activity: ActivityLevel;
  workPosture: "sentada" | "em-pe" | "peso-pesado";
  pantry: string[];
  restrictions: string[];
  otherRestriction: string;
  wakeTime: string;
  trainingTime: string;
  sleepTime: string;
  trainingDays: number[];
  lunchPlace: "casa" | "marmita" | "restaurante";
}
