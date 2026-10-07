import type { RequestHandler } from 'msw';
import { handlersAlimentos } from './alimentos';
import { handlersAuth } from './auth';
import { handlersConfiguracoes } from './configuracoes';
import { handlersDia } from './dia';
import { handlersNutri } from './nutri';
import { handlersOnboarding } from './onboarding';
import { handlersProgresso } from './progresso';
import { handlersValidacao } from './validacao';

/** Handlers padrão de todas as integrações. Cada teste troca o que precisar com `server.use()`. */
export const handlers: RequestHandler[] = [...handlersAuth, ...handlersOnboarding, ...handlersDia, ...handlersAlimentos, ...handlersNutri, ...handlersProgresso, ...handlersConfiguracoes, ...handlersValidacao];
