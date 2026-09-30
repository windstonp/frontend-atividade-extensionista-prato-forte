import { expect, test } from '@playwright/test';
import { conta, entrar } from './contas';

test('falha da IA → "Tentar de novo" → pronto (E2E-07)', async ({ page, browserName }) => {
  await entrar(page, conta('falha', browserName));
  await expect(page).toHaveURL(/\/onboarding\/resumo$/);
  await page.getByRole('button', { name: 'Gerar meu plano' }).click();

  await expect(page.getByRole('heading', { name: 'Não deu para montar agora' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Tentar de novo' }).click();

  await expect(page.getByRole('heading', { name: /Seu plano está pronto/ })).toBeVisible({ timeout: 30_000 });
});

test('restrição nova no Perfil refaz o plano e volta ao Perfil (E2E-11, CA07)', async ({ page, browserName }) => {
  await entrar(page, conta('mudanca', browserName));
  await expect(page).toHaveURL(/\/hoje$/);
  await page.goto('/perfil/preferencias');

  await page.getByRole('checkbox', { name: /Intolerância a lactose/ }).click();
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page).toHaveURL(/\/onboarding\/gerando\?plano=\d+&voltar=%2Fperfil$/);
  await expect(page).toHaveURL(/\/perfil$/, { timeout: 30_000 });
  await expect(page.getByText('Seu plano novo está pronto.')).toBeVisible();

  for (const slot of ['cafe', 'lanche', 'almoco', 'pre-treino', 'jantar']) {
    await page.goto(`/dieta/${slot}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('main')).not.toContainText(/iogurte|leite|queijo|requeijão/i);
  }
});
