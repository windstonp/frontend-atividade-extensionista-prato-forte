import { expect, test } from '@playwright/test';
import { conta, entrar } from './contas';

test('cadastrar alimento próprio e registrar; outra conta não vê (E2E-13, CA35)', async ({ page, browserName, browser }) => {
  const nome = `Barra caseira ${browserName} ${Date.now()}`;
  await entrar(page, conta('proprio', browserName));
  await expect(page).toHaveURL(/\/hoje$/);
  await page.goto('/dieta/lanche');
  await page.getByRole('button', { name: 'Adicionar alimento' }).click();
  const folha = page.getByRole('dialog');
  await folha.getByRole('searchbox').fill(nome);
  await folha.getByRole('button', { name: 'Cadastrar alimento' }).click();
  for (const [rotulo, v] of [['Calorias', '380'], ['Proteína', '30'], ['Carboidrato', '35'], ['Gordura', '12']]) {
    await folha.getByLabel(rotulo).fill(v);
  }
  await folha.getByRole('button', { name: 'Salvar e continuar' }).click();
  await folha.getByRole('textbox', { name: 'Quantidade' }).fill('40');
  await folha.getByRole('button', { name: 'Adicionar' }).click();
  await expect(page.getByRole('button', { name: new RegExp(`^${nome}, 40 g`) })).toContainText('152 kcal');

  const outra = await (await browser.newContext()).newPage();
  await entrar(outra, conta('dia', browserName));
  await expect(outra).toHaveURL(/\/hoje$/);
  await outra.goto('/dieta/lanche');
  await outra.getByRole('button', { name: 'Adicionar alimento' }).click();
  await outra.getByRole('dialog').getByRole('searchbox').fill(nome);
  await expect(outra.getByRole('dialog').getByText(`Não achamos "${nome}".`)).toBeVisible();
});

test('registrar o jantar de ontem pela Dieta (E2E-14, CA39)', async ({ page, browserName }) => {
  await entrar(page, conta('registro', browserName));
  await expect(page).toHaveURL(/\/hoje$/);
  await page.goto('/dieta');
  await expect(page.getByText(/, dia de (treino|descanso)$/)).toBeVisible(); // a aba de hoje só fica marcada depois que o dia carrega
  const dias = page.getByRole('tab');
  const hoje = await dias.evaluateAll((els) => els.findIndex((e) => e.getAttribute('aria-selected') === 'true'));
  test.skip(hoje === 0, 'Segunda-feira: ontem está na semana anterior, fora da faixa.');
  await dias.nth(hoje - 1).click();
  await page.getByRole('link', { name: /Jantar/ }).click();
  await expect(page).toHaveURL(/\/dieta\/jantar\?data=\d{4}-\d{2}-\d{2}$/);
  await expect(page.getByText(/^Ontem às/)).toBeVisible();
  const salvo = page.waitForResponse((r) => r.url().includes('/entries') && r.status() === 201);
  await page.getByRole('button', { name: /^Registrar / }).first().click();
  await salvo; // o ✓ é otimista: recarregar antes da resposta perderia o registro
  await page.reload();
  await expect(page.getByRole('button', { name: /já registrado$/ }).first()).toBeVisible();
});
