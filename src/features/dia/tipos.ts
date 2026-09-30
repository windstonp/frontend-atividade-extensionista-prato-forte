import type { Avaliacao } from '@/features/validacao/tipos';
import type { Macros } from '@/lib/types';

export type Slot = 'cafe' | 'lanche' | 'almoco' | 'pre-treino' | 'jantar';

export interface ItemDoDia {
  id: number | null;
  foodId: number;
  name: string;
  grams: number;
  amount: string;
  calories: number;
  macros: Macros;
  source: 'plan' | 'manual' | 'nutri';
  replacedFrom: string | null;
}

export interface RefeicaoDoDia {
  /** `null` na prévia de dias futuros (não gravada). */
  id: number | null;
  slot: Slot;
  name: string;
  time: string;
  note: string | null;
  position: number;
  done: boolean;
  isNext: boolean;
  summary: string;
  calories: number;
  macros: Macros;
  items: ItemDoDia[];
}

export interface Totais {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** `GET /days/{date}` (spec 03 §5), já em camelCase. */
export interface Dia {
  date: string;
  isToday: boolean;
  editable: boolean;
  materialized: boolean;
  isTrainingDay: boolean;
  targets: { kcal: number; proteinG: number; carbsG: number; fatG: number } | null;
  totals: { planned: Totais; consumed: Totais; remaining: Totais };
  meals: RefeicaoDoDia[];
  lastChange: { id: number; text: string; undoUntil: string } | null;
}

export interface OpcaoDeTroca {
  foodId: number;
  name: string;
  grams: number;
  amount: string;
  calories: number;
  macros: Macros;
  calorieDelta: number;
  note: string | null;
  inPantry: boolean;
}

export interface Substituicoes {
  item: { id: number; name: string; amount: string; calories: number; macros: Macros };
  options: OpcaoDeTroca[];
  guarantee: { restrictions: string[] };
}

export type StatusDoPlano = 'pending' | 'generating' | 'ready' | 'failed';

export interface RefeicaoDoPlano {
  slot: Slot;
  name: string;
  time: string;
  calories: number;
  summary: string;
}

/** `GET /plans/{plan}`. */
export interface Plano {
  id: number;
  status: StatusDoPlano;
  isActive: boolean;
  failureReason?: string;
  readyAt?: string;
  targets?: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  meals?: RefeicaoDoPlano[];
  rating?: Avaliacao | null;
}
