import { expect, test } from '@playwright/test';
import { conta, entrar } from './contas';

test('conversa nova, ação aplicada, voltar e continuar a anterior (E2E-08)', async ({ page, browserName }) => {
  await entrar(page, conta('nutri', browserName));
  await expect(page).toHaveURL(/\/hoje$/);

  await page.getByRole('link', { name: /^Perguntar ao Nutri sobre/ }).click();
  await expect(page).toHaveURL(/\/nutri\/\d+\?pergunta=/); // sem conversas: abre direto (CA01)
  await expect(page.getByLabel('Escreva sua pergunta para o Nutri')).not.toHaveValue('');

  await page.getByLabel('Escreva sua pergunta para o Nutri').fill('Posso trocar o arroz por batata?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();
  const substituir = page.getByRole('button', { name: /^Substituir no .* de hoje$/ });
  await expect(substituir).toBeVisible({ timeout: 15_000 });
  await substituir.click();

  await expect(page.getByText(/^Feito\. Seu .* de hoje vai com /)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desfazer' })).toBeVisible();
  const primeira = new URL(page.url()).pathname;

  await page.getByRole('link', { name: 'Voltar para as conversas' }).click();
  await expect(page.getByRole('heading', { name: 'Conversas com o Nutri' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Posso trocar o arroz por batata\?/ })).toBeVisible();

  await page.getByRole('button', { name: 'Nova conversa' }).click();
  await expect(page.getByRole('heading', { name: /^No que posso ajudar/ })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar para as conversas' }).click();

  await page.getByRole('link', { name: /Posso trocar o arroz por batata\?/ }).click();
  await expect(page).toHaveURL(new RegExp(`${primeira}$`));
  await expect(page.getByText('Posso trocar o arroz por batata?', { exact: true })).toBeVisible();
  await expect(page.getByText(/^Feito\. Seu .* de hoje vai com /)).toBeVisible();
});

test('com alergia a castanhas, o Nutri não oferece trocar por castanha (E2E-06, parte Nutri)', async ({ page, browserName }) => {
  await entrar(page, conta('alergia', browserName));
  await expect(page).toHaveURL(/\/hoje$/);
  await page.goto('/nutri');
  await expect(page).toHaveURL(/\/nutri\/\d+$/);

  await page.getByLabel('Escreva sua pergunta para o Nutri').fill('Posso pôr castanha no lanche?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();

  await expect(page.getByText(/^Com a sua restrição, castanha fica de fora/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: /^Substituir no/ })).toHaveCount(0);
  await expect(page.getByRole('group', { name: /castanha/i })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Sugestões de pergunta' })).not.toContainText(/castanha|amendoim/i);
});
