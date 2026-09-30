/** `GET /settings` como a API devolve (snake_case): o padrão do RN38. */
export function configuracoesApi(parcial: { unit_system?: string; meal_reminders?: boolean; weekly_summary?: boolean; tips?: boolean; vapid?: string | null; inscricoes?: number } = {}) {
  return {
    unit_system: parcial.unit_system ?? 'metric',
    notifications: {
      meal_reminders: parcial.meal_reminders ?? true,
      weekly_summary: parcial.weekly_summary ?? true,
      tips: parcial.tips ?? false,
    },
    push: { vapid_public_key: parcial.vapid === undefined ? 'BChaveDeTeste' : parcial.vapid, subscriptions: parcial.inscricoes ?? 0 },
  };
}
