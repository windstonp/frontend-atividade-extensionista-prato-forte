import { mockProfile } from "@/mocks/fixtures/mock-data";
import type { Profile } from "./types";

/** Resto do protótipo: Configurações ainda lê daqui até o Plano 07. */
const PAUSA_CURTA = 260;

function espera<T>(valor: T, ms = PAUSA_CURTA): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

/** GET /profile */
export function getProfile(): Promise<Profile> {
  return espera(mockProfile);
}
