import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Sem `globals: true` o Testing Library não desmonta sozinho entre testes.
afterEach(() => cleanup());

// O jsdom não tem `matchMedia`; as animações (`querMenosMovimento`) consultam "reduzir movimento".
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (consulta: string) =>
    ({
      matches: consulta.includes('reduce'),
      media: consulta,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// No Next, a versão entra pelo next.config; nos testes, direto do package.json.
import pacote from './package.json';
process.env.NEXT_PUBLIC_APP_VERSION ??= pacote.version;
