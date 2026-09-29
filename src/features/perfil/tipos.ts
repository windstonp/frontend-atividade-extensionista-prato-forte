import type { FaixaSaudavel, EfeitoNoPlano, LocalAlmoco, OrigemDaMeta, PosturaTrabalho, Sexo } from '@/features/onboarding/tipos';
import type { ActivityLevel, Goal } from '@/lib/types';

/** `GET /profile`, já em camelCase. */
export interface Perfil {
  name: string;
  preferredName: string;
  email: string;
  createdAt: string;
  goal: Goal;
  sex: Sexo;
  age: number;
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  goalWeightKg: number | null;
  goalWeightSource: OrigemDaMeta | null;
  healthyWeightRange: FaixaSaudavel;
  activityLevel: ActivityLevel;
  workPosture: PosturaTrabalho;
  wakeTime: string;
  trainingTime: string;
  sleepTime: string;
  trainingDays: number[];
  lunchPlace: LocalAlmoco;
  pantryItems: { slug: string; label: string }[];
  restrictions: { slug: string; label: string; isAllergy: boolean }[];
  otherRestrictions: string[];
  dislikedFoods: { id: number; name: string }[];
  gym: string;
  city: string;
}

/** `PUT /profile/preferences` — as quatro listas, sempre inteiras. */
export interface EntradaPreferencias {
  restrictions: string[];
  otherRestrictions: string[];
  pantryItems: string[];
  dislikedFoodIds: number[];
}

export interface RespostaPreferencias {
  data: Perfil;
  meta: { planEffect: EfeitoNoPlano; planId: number | null };
}
