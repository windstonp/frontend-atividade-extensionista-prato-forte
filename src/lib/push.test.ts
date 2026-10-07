import { afterEach, describe, expect, it, vi } from 'vitest';
import { cancelarInscricao, chaveParaBytes, inscrever, suportePush } from './push';

const inscricaoFalsa = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: 'BPublica', auth: 'segredo' } }),
  unsubscribe: vi.fn(async () => true),
};

function navegador({ push = true, permissao = 'granted' as NotificationPermission, ios = false, instalado = false, atual = null as unknown } = {}) {
  const subscribe = vi.fn(async () => inscricaoFalsa);
  vi.stubGlobal('Notification', push ? { permission: 'default', requestPermission: vi.fn(async () => permissao) } : undefined);
  vi.stubGlobal('PushManager', push ? function PushManager() {} : undefined);
  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true,
    value: push
      ? {
          register: vi.fn(async () => ({})),
          ready: Promise.resolve({ pushManager: { subscribe, getSubscription: vi.fn(async () => atual) } }),
          getRegistration: vi.fn(async () => ({ pushManager: { getSubscription: vi.fn(async () => atual) } })),
        }
      : undefined,
  });
  Object.defineProperty(window.navigator, 'userAgent', { configurable: true, value: ios ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' : 'Mozilla/5.0 (Linux; Android 14)' });
  Object.defineProperty(window.navigator, 'standalone', { configurable: true, value: instalado });
  return { subscribe };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('push', () => {
  it('detecta suporte, falta de suporte e iPhone fora da tela de início', () => {
    navegador();
    expect(suportePush()).toBe('ok');
    navegador({ push: false });
    expect(suportePush()).toBe('sem-suporte');
    navegador({ push: false, ios: true });
    expect(suportePush()).toBe('ios-sem-pwa');
    navegador({ ios: true, instalado: true });
    expect(suportePush()).toBe('ok');
  });

  it('iPad com iPadOS (se apresenta como Mac com tela de toque) conta como iPhone', () => {
    navegador({ push: false });
    Object.defineProperty(window.navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15' });
    Object.defineProperty(window.navigator, 'maxTouchPoints', { configurable: true, value: 5 });
    expect(suportePush()).toBe('ios-sem-pwa');

    Object.defineProperty(window.navigator, 'maxTouchPoints', { configurable: true, value: 0 });
    expect(suportePush()).toBe('sem-suporte'); // Mac de verdade
  });

  it('com permissão, inscreve com a chave do servidor e devolve o JSON da inscrição (CA01)', async () => {
    const { subscribe } = navegador();

    expect(await inscrever('BAAA')).toEqual({ endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: 'BPublica', auth: 'segredo' }, contentEncoding: 'aes128gcm' });
    expect(subscribe).toHaveBeenCalledWith({ userVisibleOnly: true, applicationServerKey: chaveParaBytes('BAAA') });
  });

  it('permissão negada não inscreve (CA02)', async () => {
    const { subscribe } = navegador({ permissao: 'denied' });

    expect(await inscrever('BAAA')).toBe('negada');
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('cancelar devolve o endpoint e tira a inscrição do navegador; sem inscrição, null', async () => {
    navegador({ atual: inscricaoFalsa });
    expect(await cancelarInscricao()).toBe('https://fcm.googleapis.com/fcm/send/abc');
    expect(inscricaoFalsa.unsubscribe).toHaveBeenCalled();

    navegador({ atual: null });
    expect(await cancelarInscricao()).toBeNull();
    navegador({ push: false });
    expect(await cancelarInscricao()).toBeNull();
  });

  it('chave base64url vira bytes', () => {
    expect(Array.from(chaveParaBytes('AQID'))).toEqual([1, 2, 3]);
    expect(Array.from(chaveParaBytes('_-8'))).toEqual([255, 239]);
  });
});
