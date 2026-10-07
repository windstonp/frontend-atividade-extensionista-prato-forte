import { expect, test } from '@playwright/test';
import { conta, entrar } from './contas';

test('registrar pela sugestão e pela busca persiste ao recarregar (E2E-04, CA31, CA33)', async ({ page, browserName }) => {
  await entrar(page, conta('dia', browserName));
  await expect(page).toHaveURL(/\/hoje$/);
  await page.goto('/dieta/cafe');

  const mais = page.getByRole('button', { name: /^Registrar / }).first();
  const nome = (await mais.getAttribute('aria-label'))!.replace(/^Registrar /, '').split(',')[0];
  const salvo = page.waitForResponse((r) => r.url().includes('/entries') && r.status() === 201);
  await mais.click();
  await salvo;
  await expect(page.getByRole('button', { name: `${nome} já registrado` })).toBeVisible();

  await page.getByRole('button', { name: 'Adicionar alimento' }).click();
  const folha = page.getByRole('dialog', { name: 'Adicionar alimento' });
  await folha.getByRole('searchbox', { name: 'Buscar alimento' }).fill('leite');
  await folha.getByRole('button', { name: /^Leite integral/ }).click();
  await folha.getByRole('textbox', { name: 'Quantidade' }).fill('200');
  const adicionado = page.waitForResponse((r) => r.url().includes('/entries') && r.status() === 201);
  await folha.getByRole('button', { name: 'Adicionar' }).click();
  await adicionado;

  await page.reload();
  await expect(page.getByRole('button', { name: `${nome} já registrado` })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Leite integral, 200 ml/ })).toBeVisible();

  // limpa para a próxima execução
  for (const registro of await page.getByRole('button', { name: /\. Editar$/ }).all()) {
    await registro.click();
    await page.getByRole('dialog').getByRole('button', { name: 'Remover' }).click();
  }
});

test('trocar alimento na folha, ver o toast e desfazer (E2E-05, CA08, CA09)', async ({ page, browserName }) => {
  await entrar(page, conta('dia', browserName));
  await expect(page).toHaveURL(/\/hoje$/);
  await page.goto('/dieta/almoco');

  const trocar = page.getByRole('button', { name: /^Trocar / }).first();
  const original = (await trocar.getAttribute('aria-label'))!.replace(/^Trocar /, '');
  await trocar.click();
  const folha = page.getByRole('dialog');
  await expect(folha.getByRole('radio').first()).toHaveAttribute('aria-checked', 'true');
  await folha.getByRole('button', { name: /^Usar / }).click();

  await expect(page.getByText('Trocado', { exact: true })).toBeVisible();
  await expect(page.getByText(`No lugar de ${original.toLowerCase()}`)).toBeVisible();
  await page.getByRole('button', { name: 'Desfazer' }).click();

  await expect(page.getByRole('button', { name: `Trocar ${original}` })).toBeVisible();
  await expect(page.getByText('Trocado', { exact: true })).toHaveCount(0);
});

test('com alergia a castanhas, nada no prato nem nas trocas tem castanha (E2E-06, CA02)', async ({ page, browserName }) => {
  await entrar(page, conta('alergia', browserName));
  await expect(page).toHaveURL(/\/hoje$/);

  for (const slot of ['cafe', 'lanche', 'almoco', 'pre-treino', 'jantar']) {
    await page.goto(`/dieta/${slot}`);
    const prato = page.getByRole('heading', { name: 'Sugestão para bater a meta' }).locator('..');
    await expect(prato).toBeVisible();
    await expect(prato).not.toContainText(/castanha|amendoim|nozes/i);
  }

  await page.goto('/dieta/lanche');
  await page.getByRole('button', { name: /^Trocar / }).first().click();
  const folha = page.getByRole('dialog');
  await expect(folha.getByText(/Nenhuma dessas opções tem amendoim e castanhas/)).toBeVisible();
  await expect(folha.getByRole('radiogroup')).not.toContainText(/castanha|amendoim|nozes/i);
});
