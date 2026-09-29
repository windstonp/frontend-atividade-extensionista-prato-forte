import { camelizar, snakear } from './case';
import { ApiError, MENSAGEM_ERRO_SERVIDOR, MENSAGEM_SEM_CONEXAO } from './errors';

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Opcoes {
  method?: Metodo;
  body?: unknown;
  signal?: AbortSignal;
}

interface CorpoDeErro {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
  details?: Record<string, unknown>;
}

const base = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

let cookieCsrf: Promise<void> | null = null;

/** Pede o cookie XSRF-TOKEN ao Sanctum uma vez; `renovar` força um novo. */
function garantirCsrf(renovar = false): Promise<void> {
  if (!cookieCsrf || renovar) {
    cookieCsrf = fetch(`${base()}/sanctum/csrf-cookie`, { credentials: 'include' }).then(
      () => undefined,
      (erro: unknown) => {
        cookieCsrf = null;
        throw erro;
      },
    );
  }
  return cookieCsrf;
}

function lerCookie(nome: string): string | null {
  if (typeof document === 'undefined') return null;
  const par = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${nome}=`));
  return par ? decodeURIComponent(par.slice(nome.length + 1)) : null;
}

async function enviar(caminho: string, metodo: Metodo, opcoes: Opcoes): Promise<Response> {
  const escrita = metodo !== 'GET';
  if (escrita) await garantirCsrf();

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opcoes.body !== undefined) headers['Content-Type'] = 'application/json';
  const xsrf = lerCookie('XSRF-TOKEN');
  if (escrita && xsrf) headers['X-XSRF-TOKEN'] = xsrf;

  return fetch(`${base()}/api/v1${caminho}`, {
    method: metodo,
    headers,
    credentials: 'include',
    signal: opcoes.signal,
    body: opcoes.body === undefined ? undefined : JSON.stringify(snakear(opcoes.body)),
  });
}

async function interpretar<T>(resposta: Response): Promise<T> {
  if (resposta.status === 204) return undefined as T;

  const corpo: unknown = await resposta.json().catch(() => null);
  if (resposta.ok) return camelizar<T>(corpo);

  const erro = camelizar<CorpoDeErro>(corpo ?? {});
  throw new ApiError(
    resposta.status,
    erro.code ?? 'SERVER_ERROR',
    erro.message ?? MENSAGEM_ERRO_SERVIDOR,
    erro.errors ?? {},
    erro.details ?? {},
  );
}

/**
 * Única porta para a API (`specs/00-fundacao/arquitetura-frontend.md` §3): cookie de sessão,
 * CSRF, JSON e snake_case ↔ camelCase. Devolve o corpo inteiro (`{ data, meta }`).
 */
export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const metodo = opcoes.method ?? 'GET';
  try {
    let resposta = await enviar(caminho, metodo, opcoes);
    // Token CSRF vencido (419 no Laravel, 403 FORBIDDEN na nossa API): renova e tenta uma vez.
    if (metodo !== 'GET' && resposta.status === 403) {
      await garantirCsrf(true);
      resposta = await enviar(caminho, metodo, opcoes);
    }
    return await interpretar<T>(resposta);
  } catch (erro) {
    if (erro instanceof ApiError || (erro instanceof DOMException && erro.name === 'AbortError')) throw erro;
    throw new ApiError(0, 'NETWORK_ERROR', MENSAGEM_SEM_CONEXAO);
  }
}
