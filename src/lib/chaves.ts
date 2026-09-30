/** Chaves do React Query usadas por mais de uma feature. `['me']` fica em `features/auth/hooks.ts`. */
export const CHAVES = {
  catalogo: ['catalogo'],
  onboarding: ['onboarding'],
  previa: ['previa'],
  perfil: ['perfil'],
  dias: ['dia'],
  dia: (data: string) => ['dia', data] as const,
  plano: (id: number) => ['plano', id] as const,
  conversas: ['conversas'],
  conversa: (id: number) => ['conversa', id] as const,
  mensagens: (id: number) => ['mensagens', id] as const,
  contextoNutri: ['nutri', 'contexto'],
  sugestoesNutri: ['nutri', 'sugestoes'],
} as const;
