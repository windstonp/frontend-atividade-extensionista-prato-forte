import { expect, test } from '@playwright/test';

test('das Boas-vindas ao cadastro e à primeira etapa do onboarding (CA01)', async ({ page }, info) => {
  const email = `cadastro-${info.project.name}-${Date.now()}@e2e.pratoforte.test`;

  await page.goto('/');
  await page.getByRole('link', { name: 'Montar meu plano' }).click();
  await expect(page).toHaveURL(/\/cadastro$/);

  await page.getByLabel('Nome completo').fill('Teste de Ponta');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('senha1234');
  await page.getByRole('checkbox', { name: /Li e aceito/ }).click();
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page).toHaveURL(/\/onboarding\/objetivo$/);
});
