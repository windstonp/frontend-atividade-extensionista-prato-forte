/**
 * Web Push no navegador (spec 06 §3): suporte, permissão, inscrição e saída.
 * O `sw.js` (em `public/`) mostra o aviso e abre a tela certa ao tocar.
 */

export type SuportePush = 'ok' | 'sem-suporte' | 'ios-sem-pwa';

export interface InscricaoJson {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  contentEncoding: 'aes128gcm';
}

const temPush = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && Boolean(navigator.serviceWorker) && typeof window.PushManager !== 'undefined' && typeof window.Notification !== 'undefined';

// iPadOS 13+ se apresenta como Mac; a tela de toque denuncia.
const ehIphone = () =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));
const instalado = () =>
  (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true;

/** No iPhone o push só existe com o app na tela de início (RNF-OPE-05). */
export function suportePush(): SuportePush {
  if (ehIphone() && !instalado()) return 'ios-sem-pwa';
  return temPush() ? 'ok' : 'sem-suporte';
}

/** A chave VAPID pública (base64url) no formato que o `pushManager.subscribe` pede. */
export function chaveParaBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function registro(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  return navigator.serviceWorker.ready;
}

/** A inscrição deste navegador, sem registrar o service worker só para perguntar. */
export async function inscricaoAtual(): Promise<PushSubscription | null> {
  if (!temPush()) return null;
  const reg = await navigator.serviceWorker.getRegistration('/');
  return reg ? reg.pushManager.getSubscription() : null;
}

export async function endpointAtual(): Promise<string | null> {
  return (await inscricaoAtual())?.endpoint ?? null;
}

/** O corpo que o `POST /push-subscriptions` espera. */
export function jsonDaInscricao(inscricao: PushSubscription): InscricaoJson {
  const json = inscricao.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  return { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth }, contentEncoding: 'aes128gcm' };
}

/** Pede a permissão (só aqui, CA01) e inscreve este navegador. */
export async function inscrever(chaveVapid: string): Promise<InscricaoJson | 'negada'> {
  const permissao = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permissao !== 'granted') return 'negada';
  const inscricao = await (await registro()).pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chaveParaBytes(chaveVapid) });
  return jsonDaInscricao(inscricao);
}

/** Depois do logout (CA07): tira a inscrição deste navegador; devolve o endpoint cancelado. */
export async function cancelarInscricao(): Promise<string | null> {
  const atual = await inscricaoAtual();
  if (!atual) return null;
  await atual.unsubscribe();
  return atual.endpoint;
}
