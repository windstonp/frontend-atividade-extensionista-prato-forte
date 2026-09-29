import { expect, test } from '@playwright/test';
import { concluido, entrar, NOVO, SENHA } from './contas';

test('rota protegida sem sessão vai para o login e volta depois (CA09)', async ({ page }, info) => {
  await page.goto('/hoje');
  await expect(page).toHaveURL(/\/entrar\?voltar=%2Fhoje$/);

  await page.getByLabel('E-mail').fill(concluido(info.project.name));
  await page.getByLabel('Senha', { exact: true }).fill(SENHA);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/hoje$/);
});

test('senha errada mostra o erro sem dizer qual campo (CA04)', async ({ page }, info) => {
  await entrar(page, concluido(info.project.name), 'errada123');

  // O Next também tem um role="alert" (anunciador de rota); filtra pelo texto.
  await expect(page.getByRole('alert').filter({ hasText: 'E-mail ou senha incorretos.' })).toBeVisible();
  await expect(page).toHaveURL(/\/entrar/);
});

test('onboarding pela metade leva para a etapa pendente (CA03)', async ({ page }) => {
  await entrar(page, NOVO);

  await expect(page).toHaveURL(/\/onboarding\/atividade$/);
});

test('sair volta às Boas-vindas e fecha o app (RF03)', async ({ page }, info) => {
  await entrar(page, concluido(info.project.name));
  await expect(page).toHaveURL(/\/hoje$/);

  await page.goto('/perfil/configuracoes');
  await page.getByRole('button', { name: 'Sair desta conta' }).click();
  await expect(page).toHaveURL('http://localhost:3000/');

  await page.goto('/hoje');
  await expect(page).toHaveURL(/\/entrar\?voltar=%2Fhoje$/);
});
