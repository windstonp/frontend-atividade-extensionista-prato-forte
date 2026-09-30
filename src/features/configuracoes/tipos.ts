export interface Avisos {
  mealReminders: boolean;
  weeklySummary: boolean;
  tips: boolean;
}

export type SistemaDeMedidas = 'metric' | 'imperial';

/** `GET/PUT /settings` (spec 06 §5), em camelCase. */
export interface Configuracoes {
  unitSystem: SistemaDeMedidas;
  notifications: Avisos;
  push: { vapidPublicKey: string | null; subscriptions: number };
}

export interface MudancaConfiguracoes {
  unitSystem?: SistemaDeMedidas;
  notifications?: Partial<Avisos>;
}
