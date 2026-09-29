import { expect, test } from '@playwright/test';

test('das Boas-vindas ao plano sendo gerado (CA01, E2E-01 até "Gerando")', async ({ page }, info) => {
  const email = `cadastro-${info.project.name}-${Date.now()}@e2e.pratoforte.test`;
  const continuar = () => page.getByRole('button', { name: 'Continuar' }).click();

  await page.goto('/');
  await page.getByRole('link', { name: 'Montar meu plano' }).click();
  await expect(page).toHaveURL(/\/cadastro$/);
  await page.getByLabel('Nome completo').fill('Teste de Ponta');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('senha1234');
  await page.getByRole('checkbox', { name: /Li e aceito/ }).click();
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page).toHaveURL(/\/onboarding\/objetivo$/);
  await page.getByRole('radio', { name: /Ganhar massa magra/ }).click();
  await continuar();

  await expect(page).toHaveURL(/\/onboarding\/dados$/);
  await page.getByLabel('Idade').fill('27');
  await page.getByLabel('Altura').fill('164');
  await page.getByLabel('Peso de hoje').fill('58,4');
  await page.getByRole('radio', { name: 'Feminino' }).click();
  await continuar();

  await expect(page).toHaveURL(/\/onboarding\/atividade$/);
  await page.getByRole('radio', { name: /3 ou 4 vezes na semana/ }).click();
  await page.getByRole('radio', { name: 'Sentada' }).click();
  await continuar();

  await expect(page).toHaveURL(/\/onboarding\/preferencias$/);
  for (const item of ['Ovos', 'Frango', 'Arroz e feijão', 'Banana', 'Aveia']) {
    await page.getByRole('button', { name: item, exact: true }).click();
  }
  await continuar();

  await expect(page).toHaveURL(/\/onboarding\/restricoes$/);
  await page.getByRole('checkbox', { name: /Amendoim e castanhas/ }).click();
  await continuar();

  await expect(page).toHaveURL(/\/onboarding\/rotina$/);
  for (const dia of ['segunda', 'quarta', 'sexta']) await page.getByRole('button', { name: dia, exact: true }).click();
  await page.getByRole('button', { name: 'Marmita no trabalho' }).click();
  await continuar();

  // Prévia calculada pelo backend (RN13): 27 anos, 164 cm, 58,4 kg, ganhar massa, 3–4 treinos, trabalho sentado.
  await expect(page).toHaveURL(/\/onboarding\/resumo$/);
  await expect(page.getByText(/Com isso, seu plano começa em/)).toContainText('2.250 kcal por dia, com 115 g de proteína');
  await expect(page.getByText('Amendoim e castanhas', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Gerar meu plano' }).click();

  await expect(page).toHaveURL(/\/onboarding\/gerando$/);
});
