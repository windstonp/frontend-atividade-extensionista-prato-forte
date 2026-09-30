import { mockAdherence, mockProfile, mockWeighIns } from "@/mocks/fixtures/mock-data";
import type { DayAdherence, Profile, WeighIn } from "./types";

/** Resto do protótipo: Evolução e Configurações ainda leem daqui até os Planos 06 e 07. */

const PAUSA_CURTA = 260;

function espera<T>(valor: T, ms = PAUSA_CURTA): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

/** GET /profile */
export function getProfile(): Promise<Profile> {
  return espera(mockProfile);
}

/** GET /weigh-ins */
export function getWeighIns(): Promise<WeighIn[]> {
  return espera(mockWeighIns);
}

/** GET /adherence?days=28 */
export function getAdherence(): Promise<DayAdherence[]> {
  return espera(mockAdherence);
}

/** POST /weigh-ins */
export function saveWeighIn(weightKg: number): Promise<WeighIn> {
  const hoje = new Date().toISOString().slice(0, 10);
  return espera({ date: hoje, weightKg });
}
