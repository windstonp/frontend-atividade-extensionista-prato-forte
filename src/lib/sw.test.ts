import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

/** Carrega o `public/sw.js` com um `self` falso e devolve os ouvintes registrados. */
function carregarSw(abas: { url: string; navigate: () => Promise<unknown>; focus: () => Promise<unknown> }[]) {
  const ouvintes: Record<string, (evento: unknown) => void> = {};
  const self = {
    location: { origin: 'https://app.pratoforte.test' },
    addEventListener: (tipo: string, f: (evento: unknown) => void) => (ouvintes[tipo] = f),
    skipWaiting: vi.fn(async () => undefined),
    registration: { showNotification: vi.fn(async () => undefined) },
    clients: { matchAll: vi.fn(async () => abas), openWindow: vi.fn(async () => null), claim: vi.fn(async () => undefined) },
  };
  new Function('self', readFileSync('public/sw.js', 'utf8'))(self);
  return { ouvintes, self };
}

async function tocar(ouvintes: Record<string, (evento: unknown) => void>, url = '/dieta/almoco') {
  let espera: Promise<unknown> = Promise.resolve();
  ouvintes.notificationclick({ notification: { close: vi.fn(), data: { url } }, waitUntil: (p: Promise<unknown>) => (espera = p) });
  await espera;
}

describe('sw.js', () => {
  it('assume as abas já abertas ao ativar (senão o navigate falha nelas)', async () => {
    const { ouvintes, self } = carregarSw([]);
    let espera: Promise<unknown> = Promise.resolve();
    ouvintes.activate({ waitUntil: (p: Promise<unknown>) => (espera = p) });
    await espera;
    expect(self.clients.claim).toHaveBeenCalled();
  });

  it('tocar no aviso com a aba sem controle: não trava — foca a aba ou abre a URL', async () => {
    const aba = { url: 'https://app.pratoforte.test/hoje', navigate: vi.fn(async () => Promise.reject(new TypeError('not controlled'))), focus: vi.fn(async () => aba) };
    const { ouvintes, self } = carregarSw([aba]);

    await tocar(ouvintes);

    expect(self.clients.openWindow).toHaveBeenCalledWith('https://app.pratoforte.test/dieta/almoco');
  });

  it('sem aba aberta, abre a URL; payload que não é JSON mostra o aviso padrão', async () => {
    const { ouvintes, self } = carregarSw([]);
    await tocar(ouvintes, '/evolucao');
    expect(self.clients.openWindow).toHaveBeenCalledWith('https://app.pratoforte.test/evolucao');

    let espera: Promise<unknown> = Promise.resolve();
    ouvintes.push({ data: { json: () => { throw new SyntaxError('x'); } }, waitUntil: (p: Promise<unknown>) => (espera = p) });
    await espera;
    expect(self.registration.showNotification).toHaveBeenCalledWith('Prato Forte', expect.objectContaining({ data: { url: '/hoje' } }));
  });
});
