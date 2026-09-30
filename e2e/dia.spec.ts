import { expect, test } from '@playwright/test';
import { conta, entrar } from './contas';

test('marcar refeição persiste ao recarregar; desmarcar volta (E2E-04, CA06)', async ({ page, browserName }) => {
  await entrar(page, conta('dia', browserName));
  await expect(page).toHaveURL(/\/hoje$/);
  const antes = await page.getByText(/de 5 refeições/).textContent();
  const feitas = Number(antes?.split(' ')[0]);

  const marcar = page.getByRole('button', { name: /^Marcar .* como feita$/ });
  const nome = (await marcar.getAttribute('aria-label'))!.replace(/^Marcar /, '').replace(/ como feita$/, '');
  await marcar.click();
  await expect(page.getByText(`${feitas + 1} de 5 refeições`)).toBeVisible();

  await page.reload();
  await expect(page.getByText(`${feitas + 1} de 5 refeições`)).toBeVisible();

  // desmarca pelo detalhe, para o teste poder rodar de novo
  await page.getByRole('link', { name: new RegExp(`^${nome}$`, 'i') }).click();
  await page.getByRole('button', { name: 'Desmarcar refeição' }).click();
  await page.getByRole('link', { name: 'Voltar para a dieta' }).click();
  await page.goto('/hoje');
  await expect(page.getByText(`${feitas} de 5 refeições`)).toBeVisible();
});

test('trocar alimento na folha, ver o toast e desfazer (E2E-05, CA08, CA09)', async ({ page, browserName }) => {
  await entrar(page, conta('dia', browserName));
  await expect(page).toHaveURL(/\/hoje$/);
  await page.goto('/dieta/almoco');

  const trocar = page.getByRole('button', { name: /^Trocar / }).first();
  const original = (await trocar.textContent())!.replace(/^Trocar\s*/, '').trim();
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
    const prato = page.getByRole('list').filter({ has: page.getByRole('button', { name: /^Trocar / }) });
    await expect(prato).toBeVisible();
    await expect(prato).not.toContainText(/castanha|amendoim|nozes/i);
  }

  await page.goto('/dieta/lanche');
  await page.getByRole('button', { name: /^Trocar / }).first().click();
  const folha = page.getByRole('dialog');
  await expect(folha.getByText(/Nenhuma dessas opções tem amendoim e castanhas/)).toBeVisible();
  await expect(folha.getByRole('radiogroup')).not.toContainText(/castanha|amendoim|nozes/i);
});
