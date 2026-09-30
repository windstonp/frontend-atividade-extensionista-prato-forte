/** Tipos compartilhados do Prato Forte; os de cada feature ficam no `tipos.ts` dela. */

export type Goal =
  | "ganhar-massa"
  | "perder-gordura"
  | "manter-peso"
  | "mais-disposicao";

export type ActivityLevel = "parado" | "leve" | "moderado" | "intenso";

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
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

/** Etapas do onboarding, na ordem do fluxo (espelha `App\Enums\OnboardingStep`). */
export type EtapaOnboarding =
  | "objetivo"
  | "dados"
  | "atividade"
  | "preferencias"
  | "restricoes"
  | "rotina"
  | "resumo";

/** Conta autenticada, como `GET /me` devolve (já em camelCase). */
export interface User {
  id: number;
  name: string;
  email: string;
  preferredName: string;
  onboardingCompleted: boolean;
  nextStep: EtapaOnboarding | null;
  createdAt: string;
  settings?: { unitSystem: "metric" | "imperial" };
}
