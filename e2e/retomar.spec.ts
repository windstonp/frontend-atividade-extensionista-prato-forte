import { expect, test } from '@playwright/test';
import { entrar, NOVO } from './contas';

test('retoma o onboarding de onde parou, com as respostas salvas (E2E-03, CA01)', async ({ page }) => {
  await entrar(page, NOVO);
  await expect(page).toHaveURL(/\/onboarding\/atividade$/);

  await page.getByRole('link', { name: 'Voltar' }).click();

  await expect(page).toHaveURL(/\/onboarding\/dados$/);
  await expect(page.getByLabel('Como podemos te chamar')).toHaveValue('Nina');
  await expect(page.getByLabel('Idade')).toHaveValue('30');
  await expect(page.getByLabel('Altura')).toHaveValue('170');
  await expect(page.getByLabel('Peso de hoje')).toHaveValue('70');
});
