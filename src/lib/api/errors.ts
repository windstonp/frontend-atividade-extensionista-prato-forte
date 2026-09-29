/** Erro da API no formato único do backend (`specs/00-fundacao/api-convencoes-e-erros.md` §3). */
export type FieldErrors = Record<string, string[]>;

export const MENSAGEM_SEM_CONEXAO = 'Sem conexão. Confira a internet e tente de novo.';
export const MENSAGEM_ERRO_SERVIDOR = 'Algo deu errado do nosso lado. Tente de novo.';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: FieldErrors = {},
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Primeira mensagem de cada campo, como os formulários mostram. */
export function primeirasMensagens(erros: FieldErrors): Record<string, string> {
  return Object.fromEntries(Object.entries(erros).map(([campo, mensagens]) => [campo, mensagens[0] ?? '']));
}

/** Garante um ApiError: o que não veio da API é tratado como falta de conexão. */
export function comoApiError(erro: unknown): ApiError {
  return erro instanceof ApiError ? erro : new ApiError(0, 'NETWORK_ERROR', MENSAGEM_SEM_CONEXAO);
}
