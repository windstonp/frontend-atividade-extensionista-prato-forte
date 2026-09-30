import { expect, test } from '@playwright/test';
import { conta, entrar } from './contas';

test('avaliar resposta do Nutri e responder o questionário (E2E-12)', async ({ page, browserName }) => {
  await entrar(page, conta('avaliar', browserName));
  await expect(page).toHaveURL(/\/hoje$/);

  await page.goto('/nutri');
  await expect(page).toHaveURL(/\/nutri\/\d+$/);
  await page.getByLabel('Escreva sua pergunta para o Nutri').fill('Posso trocar o arroz por batata?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();
  const util = page.getByRole('button', { name: 'Resposta útil' });
  await expect(util).toBeVisible({ timeout: 15_000 });
  await util.click();
  await expect(util).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resposta útil' })).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/hoje');
  await page.getByRole('link', { name: 'Responder' }).click();
  await expect(page).toHaveURL(/\/perfil\/avaliar$/);
  for (let i = 0; i < 10; i++) {
    await page.getByRole('radio', { name: 'Concordo', exact: true }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
  await page.getByRole('radio', { name: '4', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByRole('heading', { name: 'Obrigado por avaliar!' })).toBeVisible();

  await page.goto('/perfil');
  await expect(page.getByText('Obrigado por avaliar!')).toBeVisible();
});
