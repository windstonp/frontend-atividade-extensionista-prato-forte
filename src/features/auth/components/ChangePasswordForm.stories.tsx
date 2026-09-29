import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ApiError } from '@/lib/api/errors';
import { ChangePasswordForm } from './ChangePasswordForm';

type Tela = ReturnType<typeof within>;

async function preencher(tela: Tela) {
  await userEvent.type(tela.getByLabelText('Senha atual'), 'senha1234');
  await userEvent.type(tela.getByLabelText('Nova senha'), 'novaSenha9');
  await userEvent.type(tela.getByLabelText('Confirme a nova senha'), 'novaSenha9');
  await userEvent.click(tela.getByRole('button', { name: 'Salvar' }));
}

const meta = {
  title: 'Conta/ChangePasswordForm',
  component: ChangePasswordForm,
  args: { aoEnviar: fn(async () => undefined) },
} satisfies Meta<typeof ChangePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Valido: Story = {
  play: async ({ canvasElement, args }) => {
    await preencher(within(canvasElement));
    await expect(args.aoEnviar).toHaveBeenCalledWith({
      currentPassword: 'senha1234',
      password: 'novaSenha9',
      passwordConfirmation: 'novaSenha9',
    });
  },
};

export const SenhaAtualErrada: Story = {
  args: {
    aoEnviar: fn(async () => {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', {
        currentPassword: ['A senha atual não confere.'],
      });
    }),
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await preencher(tela);
    await waitFor(() => expect(tela.getByText('A senha atual não confere.')).toBeVisible());
    await expect(tela.getByLabelText('Senha atual')).toHaveAttribute('aria-invalid', 'true');
  },
};
