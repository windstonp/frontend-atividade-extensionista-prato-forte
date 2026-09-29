import { ApiError } from '@/lib/api/errors';
import type { User } from '@/lib/types';

export type Area = 'app' | 'onboarding';

/** Telas do onboarding que continuam válidas depois de concluir (geração do plano). */
const ONBOARDING_POS_CONCLUSAO = ['/onboarding/gerando', '/onboarding/pronto'];

/**
 * `?voltar=` só aceita caminho interno (spec 01, N02): começa com uma barra só, sem barra
 * invertida nem espaço/controle (o navegador ignora TAB e trata `\` como `/`).
 */
export function safeRedirect(voltar?: string | null): string | null {
  if (!voltar || !voltar.startsWith('/') || voltar.startsWith('//')) return null;
  if (/[\s\\]/.test(voltar)) return null;
  return voltar;
}

/** Para onde ir depois de entrar ou criar a conta (RF02, CA03, CA09). */
export function destinoAposEntrar(user: Pick<User, 'onboardingCompleted' | 'nextStep'>, voltar?: string | null): string {
  if (!user.onboardingCompleted) return `/onboarding/${user.nextStep ?? 'objetivo'}`;
  return safeRedirect(voltar) ?? '/hoje';
}

/** Decisão dos guardas de layout; `null` = pode mostrar a tela. */
export function destinoDoGuarda({
  area,
  user,
  erro,
  caminho,
  busca,
}: {
  area: Area;
  user?: User;
  erro?: unknown;
  caminho: string;
  busca: string;
}): string | null {
  if (erro instanceof ApiError && erro.status === 401) {
    const atual = busca ? `${caminho}?${busca}` : caminho;
    return `/entrar?voltar=${encodeURIComponent(atual)}`;
  }
  if (!user) return null;
  if (area === 'app' && !user.onboardingCompleted) return `/onboarding/${user.nextStep ?? 'objetivo'}`;
  const editando = new URLSearchParams(busca).get('editar') === '1';
  if (area === 'onboarding' && user.onboardingCompleted && !editando && !ONBOARDING_POS_CONCLUSAO.includes(caminho)) {
    return '/hoje';
  }
  return null;
}
