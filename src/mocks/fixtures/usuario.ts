/** Usuário como a API devolve (snake_case), com onboarding concluído. */
export const usuarioApi = {
  id: 7,
  name: 'Camila Réus',
  email: 'camila.reus@gmail.com',
  preferred_name: 'Camila',
  onboarding_completed: true,
  next_step: null as string | null,
  created_at: '2026-09-23T10:00:00-03:00',
  settings: { unit_system: 'metric' },
};

export const comOnboardingEm = (etapa: string) => ({ ...usuarioApi, onboarding_completed: false, next_step: etapa });
