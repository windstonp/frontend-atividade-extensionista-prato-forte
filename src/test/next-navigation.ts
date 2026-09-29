import { vi } from 'vitest';

/**
 * Falso de `next/navigation` para testes de integração:
 *   vi.mock('next/navigation', () => import('@/test/next-navigation'));
 */
export const roteador = {
  replace: vi.fn(),
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

let atual = new URL('http://localhost:3000/');

export const useRouter = () => roteador;
export const usePathname = () => atual.pathname;
export const useSearchParams = () => atual.searchParams;

/** Define a URL que os componentes enxergam (caminho + busca). */
export function definirUrl(caminho: string) {
  atual = new URL(caminho, 'http://localhost:3000');
}

export function redefinirNavegacao() {
  Object.values(roteador).forEach((funcao) => funcao.mockReset());
  definirUrl('/');
}
