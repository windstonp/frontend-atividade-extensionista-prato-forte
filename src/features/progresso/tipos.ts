export type Periodo = '6w' | '3m' | 'all';
export type StatusDia = 'completo' | 'parcial' | 'vazio' | 'hoje';

/** `GET /weigh-ins` (camelCase). */
export interface Pesagem {
  id: number;
  date: string;
  weightKg: number;
}

export interface PesoDoPeriodo {
  startKg: number | null;
  currentKg: number | null;
  goalKg: number | null;
  goalSource: string | null;
  changeKg: number | null;
  spanWeeks: number | null;
  points: { date: string; weightKg: number }[];
  forecast: { date: string; label: string } | null;
}

export interface Constancia {
  days: { date: string; status: StatusDia }[];
  completeDays: number;
  streak: number;
}

export interface Medias {
  daysCounted: number;
  protein: { avgG: number | null; targetG: number | null };
  calories: { avgKcal: number | null; targetKcal: number | null };
  insight: string | null;
}

/** `GET /progress?period=` (spec 05 §5). */
export interface Progresso {
  period: Periodo;
  weight: PesoDoPeriodo;
  adherence: Constancia;
  averages: Medias;
}
