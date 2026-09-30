import type { Avisos } from './tipos';

/** O que o item "Notificações e conta" do Perfil diz (spec 06 §4). */
export function resumoDosAvisos(avisos: Avisos): string {
  const ligados = [avisos.mealReminders, avisos.weeklySummary, avisos.tips].filter(Boolean).length;
  if (ligados === 0) return 'Avisos desligados';
  if (ligados === 1 && avisos.mealReminders) return 'Lembretes de refeição ligados';
  return `${ligados} ${ligados === 1 ? 'aviso ligado' : 'avisos ligados'}`;
}
