import { http, HttpResponse } from 'msw';
import { catalogoApi, onboardingApi } from '../fixtures/onboarding';
import { url } from './auth';

/** Padrão: catálogo completo e onboarding sem nada salvo. */
export const handlersOnboarding = [
  http.get(url('/catalog/onboarding'), () => HttpResponse.json({ data: catalogoApi })),
  http.get(url('/onboarding'), () => HttpResponse.json({ data: onboardingApi() })),
];

/** `GET /onboarding` com estas respostas. */
export const respondendoOnboarding = (parcial: Parameters<typeof onboardingApi>[0]) =>
  http.get(url('/onboarding'), () => HttpResponse.json({ data: onboardingApi(parcial) }));

/** `PATCH /profile/steps/{etapa}` que guarda os corpos recebidos (já em snake_case, como no fio). */
export function gravandoEtapa(etapa: string, meta: { warnings?: string[] } = {}) {
  const corpos: unknown[] = [];
  const handler = http.patch(url(`/profile/steps/${etapa}`), async ({ request }) => {
    corpos.push(await request.json());
    return HttpResponse.json({
      data: onboardingApi({ completed_steps: [etapa] }),
      meta: { plan_effect: 'none', plan_id: null, warnings: meta.warnings ?? [] },
    });
  });
  return { handler, corpos };
}
