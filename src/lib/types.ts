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
