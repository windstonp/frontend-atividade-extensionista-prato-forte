import { describe, expect, it } from 'vitest';
import { MENSAGENS, validarCadastro, validarLogin, validarNovaSenha, validarTrocaSenha } from './schemas';

const cadastroValido = { name: 'Camila Réus', email: 'camila@exemplo.com', password: 'senha1234', termsAccepted: true };

describe('validarCadastro', () => {
  it('aceita um cadastro válido', () => {
    expect(validarCadastro(cadastroValido)).toEqual({});
  });

  it.each([
    ['nome curto', { name: ' C ' }, 'name', MENSAGENS.nome],
    ['nome longo', { name: 'a'.repeat(121) }, 'name', MENSAGENS.nome],
    ['e-mail sem domínio', { email: 'camila@' }, 'email', MENSAGENS.email],
    ['senha curta', { password: 'abc1' }, 'password', MENSAGENS.senhaFraca],
    ['senha sem número', { password: 'senhasenha' }, 'password', MENSAGENS.senhaFraca],
    ['senha sem letra', { password: '12345678' }, 'password', MENSAGENS.senhaFraca],
    ['senha com mais de 72', { password: 'a1'.repeat(37) }, 'password', MENSAGENS.senhaLonga],
    ['termo não aceito', { termsAccepted: false }, 'termsAccepted', MENSAGENS.termo],
  ])('%s', (_, troca, campo, mensagem) => {
    expect(validarCadastro({ ...cadastroValido, ...troca })).toEqual({ [campo]: mensagem });
  });

  it('aceita senha com letras acentuadas (RN02 conta qualquer alfabeto)', () => {
    expect(validarCadastro({ ...cadastroValido, password: 'ação12345' })).toEqual({});
  });
});

describe('validarLogin', () => {
  it('pede e-mail válido e senha', () => {
    expect(validarLogin({ email: '', password: '' })).toEqual({ email: MENSAGENS.email, password: MENSAGENS.senhaVazia });
  });
});

describe('validarNovaSenha', () => {
  it('confere a confirmação', () => {
    expect(validarNovaSenha({ password: 'senha1234', passwordConfirmation: 'senha12345' })).toEqual({
      passwordConfirmation: MENSAGENS.senhasDiferentes,
    });
  });
});

describe('validarTrocaSenha', () => {
  it('pede a senha atual', () => {
    expect(validarTrocaSenha({ currentPassword: '', password: 'senha1234', passwordConfirmation: 'senha1234' })).toEqual({
      currentPassword: MENSAGENS.senhaAtualVazia,
    });
  });
});
