import type { Avaliacao } from '@/features/validacao/tipos';
import type { Macros } from '@/lib/types';

export type Slot = 'cafe' | 'lanche' | 'almoco' | 'pre-treino' | 'jantar';

/** Sólido em gramas, líquido em mililitros (RN47). */
export type Medida = 'g' | 'ml';

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
  measure: Medida;
  /** Já existe registro ligado a este item sugerido (o "+" vira ✓). */
  registered: boolean;
}

/** O que foi comido, com retrato dos números do momento (RN49). */
export interface Registro {
  id: number;
  foodId: number | null;
  customFoodId: number | null;
  suggestionItemId: number | null;
  name: string;
  amount: number;
  measure: Medida;
  amountText: string;
  calories: number;
  macros: Macros;
  /** Restrições do usuário que este alimento toca (RN51): avisa, não bloqueia. */
  conflicts: string[];
}

/** RN48 — situação da refeição. */
export interface StatusDaMeta {
  calories: 'below' | 'ok' | 'above';
  protein: 'below' | 'ok';
  fat: 'ok' | 'above';
}

export interface RefeicaoDoDia {
  /** `null` na prévia de dias futuros (não gravada). */
  id: number | null;
  slot: Slot;
  name: string;
  time: string;
  note: string | null;
  position: number;
  /** Tem pelo menos um registro (RN46). */
  done: boolean;
  isNext: boolean;
  summary: string;
  /** Meta da refeição = soma da sugestão (RN48). */
  calories: number;
  macros: Macros;
  /** Sugestão da refeição (D13): o que recomendamos, não o que foi comido. */
  items: ItemDoDia[];
  consumed: Totais;
  status: StatusDaMeta | null;
  goalMet: boolean;
  entries: Registro[];
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

/** Resultado da busca de alimentos (RN50). */
export interface AlimentoBusca {
  id: number;
  kind: 'catalog' | 'custom';
  name: string;
  measure: Medida;
  group: string | null;
  per100: Totais;
  portion: { amount: number; text: string } | null;
  household: { label: string; labelPlural: string | null; amount: number } | null;
  conflicts: string[];
  lastAmount?: number;
}

/** Uma entrada de `POST …/entries`: o "+" da sugestão, um alimento do catálogo ou um próprio. */
export type NovaEntrada =
  | { suggestionItemId: number; amount?: number }
  | { foodId: number; amount: number }
  | { customFoodId: number; amount: number };

export interface AlimentoProprioDados {
  name: string;
  measure: Medida;
  per100: Totais;
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
