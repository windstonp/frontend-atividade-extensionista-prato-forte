import type { ActivityLevel, EtapaOnboarding, Goal } from '@/lib/types';

export type Sexo = 'feminino' | 'masculino' | 'nao-dizer';
export type PosturaTrabalho = 'sentada' | 'em-pe' | 'peso-pesado';
export type LocalAlmoco = 'casa' | 'marmita' | 'restaurante';
export type OrigemDaMeta = 'user' | 'suggested' | 'auto';
export type EtapaEditavel = Exclude<EtapaOnboarding, 'resumo'>;
/** RN21 — neste plano a API sempre devolve `none`; o Plano 04 liga os outros. */
export type EfeitoNoPlano = 'none' | 'regeneration_suggested' | 'regeneration_started' | 'times_updated';

/** `GET /catalog/onboarding`, já em camelCase. */
export interface Catalogo {
  goals: { value: Goal; label: string; description: string }[];
  activityLevels: { value: ActivityLevel; label: string; description: string }[];
  workPostures: { value: PosturaTrabalho; label: string }[];
  restrictions: { slug: string; label: string; isAllergy: boolean }[];
  pantry: { category: string; label: string; items: { slug: string; label: string }[] }[];
  dislikeOptions: { id: number; name: string }[];
  lunchPlaces: { value: LocalAlmoco; label: string }[];
}

export interface Respostas {
  goal: Goal | null;
  preferredName: string | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  sex: Sexo | null;
  goalWeightKg: number | null;
  goalWeightSource: OrigemDaMeta | null;
  activityLevel: ActivityLevel | null;
  workPosture: PosturaTrabalho | null;
  pantryItems: string[];
  restrictions: string[];
  otherRestrictions: string[];
  wakeTime: string | null;
  trainingTime: string | null;
  sleepTime: string | null;
  trainingDays: number[];
  lunchPlace: LocalAlmoco | null;
}

export interface FaixaSaudavel {
  min: number;
  max: number;
}

/** `GET /onboarding`. */
export interface DadosOnboarding {
  completed: boolean;
  completedSteps: EtapaOnboarding[];
  nextStep: EtapaOnboarding | null;
  answers: Respostas;
  healthyWeightRange: FaixaSaudavel | null;
}

export interface MetaDaResposta {
  planEffect: EfeitoNoPlano;
  planId: number | null;
  /** Códigos: `GOAL_WEIGHT_OUT_OF_HEALTHY_RANGE`, `GOAL_WEIGHT_RESET`. */
  warnings: string[];
}

/** `GET /plans/preview-targets` (RN13). */
export interface Previa {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  meals: number;
}
