import type { RequestHandler } from 'msw';
import { handlersAuth } from './auth';
import { handlersDia } from './dia';
import { handlersOnboarding } from './onboarding';

/** Handlers padrão de todas as integrações. Cada teste troca o que precisar com `server.use()`. */
export const handlers: RequestHandler[] = [...handlersAuth, ...handlersOnboarding, ...handlersDia];
