/** Validação no front, espelho das regras do backend (RN01, RN02; spec 01 §6). */
export const MENSAGENS = {
  nome: 'Escreva seu nome.',
  email: 'Confira o e-mail.',
  senhaFraca: 'Use 8 ou mais caracteres, com letra e número.',
  senhaLonga: 'Use no máximo 72 caracteres.',
  senhasDiferentes: 'As senhas não conferem.',
  senhaVazia: 'Digite sua senha.',
  senhaAtualVazia: 'Digite a senha atual.',
  termo: 'Para continuar, aceite o termo.',
} as const;

export type Erros<C extends string> = Partial<Record<C, string>>;

export interface DadosCadastro {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

export interface DadosLogin {
  email: string;
  password: string;
}

export interface DadosNovaSenha {
  password: string;
  passwordConfirmation: string;
}

export interface DadosTrocaSenha extends DadosNovaSenha {
  currentPassword: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function limpar<C extends string>(erros: Erros<C>): Erros<C> {
  return Object.fromEntries(Object.entries(erros).filter(([, mensagem]) => mensagem)) as Erros<C>;
}

export function erroEmail(email: string): string | undefined {
  return EMAIL.test(email.trim()) ? undefined : MENSAGENS.email;
}

/** RN02 — 8 a 72 caracteres (contados como o backend conta), letra de qualquer alfabeto e número. */
export function erroSenhaNova(senha: string): string | undefined {
  const tamanho = [...senha].length;
  if (tamanho > 72) return MENSAGENS.senhaLonga;
  if (tamanho < 8 || !/\p{L}/u.test(senha) || !/\d/.test(senha)) return MENSAGENS.senhaFraca;
  return undefined;
}

export function validarCadastro(d: DadosCadastro): Erros<keyof DadosCadastro> {
  const nome = d.name.trim();
  return limpar({
    name: nome.length < 2 || nome.length > 120 ? MENSAGENS.nome : undefined,
    email: erroEmail(d.email),
    password: erroSenhaNova(d.password),
    termsAccepted: d.termsAccepted ? undefined : MENSAGENS.termo,
  });
}

export function validarLogin(d: DadosLogin): Erros<keyof DadosLogin> {
  return limpar({
    email: erroEmail(d.email),
    password: d.password ? undefined : MENSAGENS.senhaVazia,
  });
}

export function validarNovaSenha(d: DadosNovaSenha): Erros<keyof DadosNovaSenha> {
  return limpar({
    password: erroSenhaNova(d.password),
    passwordConfirmation: d.password !== d.passwordConfirmation ? MENSAGENS.senhasDiferentes : undefined,
  });
}

export function validarTrocaSenha(d: DadosTrocaSenha): Erros<keyof DadosTrocaSenha> {
  return limpar({
    currentPassword: d.currentPassword ? undefined : MENSAGENS.senhaAtualVazia,
    ...validarNovaSenha(d),
  });
}
