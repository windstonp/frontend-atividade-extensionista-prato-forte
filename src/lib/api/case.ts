const paraCamel = (chave: string) => chave.replace(/_([a-z0-9])/g, (_, letra: string) => letra.toUpperCase());
const paraSnake = (chave: string) => chave.replace(/[A-Z]/g, (letra) => `_${letra.toLowerCase()}`);

function converter(valor: unknown, chave: (texto: string) => string): unknown {
  if (Array.isArray(valor)) return valor.map((item) => converter(item, chave));
  if (valor !== null && typeof valor === 'object' && Object.getPrototypeOf(valor) === Object.prototype) {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [chave(k), converter(v, chave)]));
  }
  return valor;
}

/** Resposta da API (snake_case) → front (camelCase). Só as chaves mudam. */
export const camelizar = <T>(valor: unknown) => converter(valor, paraCamel) as T;

/** Corpo do front (camelCase) → API (snake_case). */
export const snakear = (valor: unknown) => converter(valor, paraSnake);
