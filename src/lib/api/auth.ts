import type { User } from '@/lib/types';
import { api } from './client';

type Dados<T> = { data: T };
type Mensagem = { message: string };

export interface EntradaCadastro {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  termsAccepted: boolean;
  termsVersion: string;
}

/** POST /register */
export const register = (entrada: EntradaCadastro) =>
  api<Dados<User>>('/register', { method: 'POST', body: entrada }).then((r) => r.data);

/** POST /login */
export const login = (entrada: { email: string; password: string }) =>
  api<Dados<User>>('/login', { method: 'POST', body: entrada }).then((r) => r.data);

/** POST /logout */
export const logout = () => api<void>('/logout', { method: 'POST' });

/** GET /me */
export const getMe = () => api<Dados<User>>('/me').then((r) => r.data);

/** POST /password/forgot — a resposta é sempre a mesma (RN04). */
export const forgotPassword = (email: string) => api<Mensagem>('/password/forgot', { method: 'POST', body: { email } });

/** POST /password/reset */
export const resetPassword = (entrada: { token: string; email: string; password: string; passwordConfirmation: string }) =>
  api<Mensagem>('/password/reset', { method: 'POST', body: entrada });

/** PUT /me/password */
export const updatePassword = (entrada: { currentPassword: string; password: string; passwordConfirmation: string }) =>
  api<Mensagem>('/me/password', { method: 'PUT', body: entrada });

/** DELETE /me */
export const deleteAccount = (password: string) => api<void>('/me', { method: 'DELETE', body: { password } });
