import { http, HttpResponse } from 'msw';
import { catalogoApi, onboardingApi } from '../fixtures/onboarding';
import { url } from './auth';

/** Padrão: catálogo completo e onboarding sem nada salvo. */
export const handlersOnboarding = [
  http.get(url('/catalog/onboarding'), () => HttpResponse.json({ data: catalogoApi })),
  http.get(url('/onboarding'), () => HttpResponse.json({ data: onboardingApi() })),
];
