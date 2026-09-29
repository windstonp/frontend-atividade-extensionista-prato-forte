import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ResetPasswordForm } from './ResetPasswordForm';

const meta = {
  title: 'Conta/ResetPasswordForm',
  component: ResetPasswordForm,
  args: { aoEnviar: fn(async () => undefined) },
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Valido: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.type(tela.getByLabelText('Nova senha'), 'novaSenha9');
    await userEvent.type(tela.getByLabelText('Confirme a nova senha'), 'novaSenha9');
    await userEvent.click(tela.getByRole('button', { name: 'Salvar senha' }));
    await expect(args.aoEnviar).toHaveBeenCalledWith({ password: 'novaSenha9', passwordConfirmation: 'novaSenha9' });
  },
};

export const SenhasDiferentes: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.type(tela.getByLabelText('Nova senha'), 'novaSenha9');
    await userEvent.type(tela.getByLabelText('Confirme a nova senha'), 'novaSenha8');
    await userEvent.click(tela.getByRole('button', { name: 'Salvar senha' }));
    await waitFor(() => expect(tela.getByText('As senhas não conferem.')).toBeVisible());
    await expect(args.aoEnviar).not.toHaveBeenCalled();
  },
};

export const Enviando: Story = {
  args: { aoEnviar: fn(() => new Promise<never>(() => {})) },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.type(tela.getByLabelText('Nova senha'), 'novaSenha9');
    await userEvent.type(tela.getByLabelText('Confirme a nova senha'), 'novaSenha9');
    await userEvent.click(tela.getByRole('button', { name: 'Salvar senha' }));
    await expect(await tela.findByRole('button', { name: 'Salvando…' })).toHaveAttribute('aria-busy', 'true');
  },
};
