import type { RequestHandler } from 'msw';

/** Handlers padrão de todas as integrações. Cada teste troca o que precisar com `server.use()`. */
export const handlers: RequestHandler[] = [];
