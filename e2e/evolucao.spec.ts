import { expect, test } from '@playwright/test';
import { conta, entrar } from './contas';

test('registrar o peso de hoje e ver no gráfico, no Hoje e na previsão (E2E-09, CA08)', async ({ page, browserName }) => {
  await entrar(page, conta('peso', browserName));
  await expect(page).toHaveURL(/\/hoje$/);

  await page.goto('/evolucao');
  await expect(page.getByRole('img', { name: 'Peso de 58,4 kg para 59,0 kg, com meta de 62,0 kg' })).toBeVisible();

  await page.getByRole('link', { name: 'Registrar peso da semana' }).click();
  await expect(page.getByRole('button', { name: 'Digitar o peso: 59,0 kg' })).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Aumentar 100 gramas' }).click();
  await expect(page.getByText('São 300 g a mais que na última pesagem. Dentro do esperado para quem está ganhando massa.')).toBeVisible();
  await page.getByRole('button', { name: 'Salvar peso de hoje' }).click();

  await expect(page).toHaveURL(/\/evolucao$/);
  await expect(page.getByRole('img', { name: 'Peso de 58,4 kg para 59,3 kg, com meta de 62,0 kg' })).toBeVisible();
  await expect(page.getByText(/^No ritmo das últimas semanas, você chega na meta por volta d/)).toBeVisible();

  await page.goto('/hoje');
  await expect(page.getByText('59,3 kg de 62,0 kg')).toBeVisible();
});
