import { type APIRequestContext, expect, type Page } from '@playwright/test';

/** Contas do E2ESeeder (repo backend). */
export const SENHA = 'senha1234';
/** Uma conta concluída por navegador: o login aceita 5 tentativas por minuto por e-mail. */
export const concluido = (navegador: string) => `concluido-${navegador}@e2e.pratoforte.test`;
export const NOVO = 'novo@e2e.pratoforte.test';
export const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:8025';

export async function entrar(page: Page, email: string, senha = SENHA) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

export async function limparCaixa(request: APIRequestContext, email: string) {
  await request.delete(`${MAILPIT}/api/v1/search`, { params: { query: `to:"${email}"` } });
}

/** Espera o e-mail de redefinição chegar ao Mailpit e devolve o link para o front. */
export async function linkDeRedefinicao(request: APIRequestContext, email: string): Promise<string> {
  let link = '';
  await expect
    .poll(
      async () => {
        const busca = await request.get(`${MAILPIT}/api/v1/search`, { params: { query: `to:"${email}"` } });
        const { messages } = (await busca.json()) as { messages?: { ID: string }[] };
        if (!messages?.length) return '';
        const mensagem = (await (await request.get(`${MAILPIT}/api/v1/message/${messages[0].ID}`)).json()) as { Text: string };
        link = mensagem.Text.match(/http:\/\/localhost:3000\/senha\/redefinir\?\S+/)?.[0] ?? '';
        return link;
      },
      { timeout: 15_000 },
    )
    .not.toBe('');
  return link;
}

/** Contas do 04B, uma por navegador: `dia`, `alergia`, `mudanca`, `falha`. */
export const conta = (tipo: 'dia' | 'alergia' | 'mudanca' | 'falha' | 'nutri' | 'peso', navegador: string) => `${tipo}-${navegador}@e2e.pratoforte.test`;
