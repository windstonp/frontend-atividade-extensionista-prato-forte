import { expect, test } from '@playwright/test';
import { limparCaixa, linkDeRedefinicao } from './contas';

test('recuperar a senha pelo e-mail e entrar com a nova', async ({ page, request }, info) => {
  const email = `senha-${info.project.name}@e2e.pratoforte.test`;
  const nova = `nova${Date.now()}a`;
  await limparCaixa(request, email);

  await page.goto('/entrar');
  await page.getByRole('link', { name: 'Esqueci minha senha' }).click();
  await page.getByLabel('E-mail').fill(email);
  await page.getByRole('button', { name: 'Enviar link' }).click();
  await expect(page.getByRole('heading', { name: 'Confira seu e-mail' })).toBeVisible();

  await page.goto(await linkDeRedefinicao(request, email));
  await page.getByLabel('Nova senha', { exact: true }).fill(nova);
  await page.getByLabel('Confirme a nova senha').fill(nova);
  await page.getByRole('button', { name: 'Salvar senha' }).click();

  await expect(page.getByText('Senha nova salva. Entre com ela.')).toBeVisible();
  await expect(page.getByLabel('E-mail')).toHaveValue(email);
  await page.getByLabel('Senha', { exact: true }).fill(nova);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/hoje$/);
});
