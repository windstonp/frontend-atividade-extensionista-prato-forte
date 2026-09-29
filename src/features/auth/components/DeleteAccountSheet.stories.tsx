import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ApiError } from '@/lib/api/errors';
import { DeleteAccountSheet } from './DeleteAccountSheet';

const meta = {
  title: 'Conta/DeleteAccountSheet',
  component: DeleteAccountSheet,
  args: { aberta: true, aoFechar: fn(), aoApagar: fn(async () => undefined) },
} satisfies Meta<typeof DeleteAccountSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Aberta: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    const dialogo = tela.getByRole('dialog', { name: 'Apagar sua conta?' });
    await waitFor(() => expect(dialogo).toHaveFocus());
    await waitFor(() => expect(tela.getByText('Não dá para desfazer.')).toBeVisible());

    await userEvent.click(tela.getByRole('button', { name: 'Apagar tudo' }));
    await waitFor(() => expect(tela.getByText('Digite sua senha.')).toBeVisible());
    await expect(args.aoApagar).not.toHaveBeenCalled();

    await userEvent.type(tela.getByLabelText('Sua senha'), 'senha1234');
    await userEvent.click(tela.getByRole('button', { name: 'Apagar tudo' }));
    await expect(args.aoApagar).toHaveBeenCalledWith('senha1234');
  },
};

export const SenhaIncorreta: Story = {
  args: {
    aoApagar: fn(async () => {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', { password: ['A senha não confere.'] });
    }),
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.type(tela.getByLabelText('Sua senha'), 'errada123');
    await userEvent.click(tela.getByRole('button', { name: 'Apagar tudo' }));
    await waitFor(() => expect(tela.getByText('A senha não confere.')).toBeVisible());
  },
};

export const Apagando: Story = {
  args: { aoApagar: fn(() => new Promise<never>(() => {})) },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.type(tela.getByLabelText('Sua senha'), 'senha1234');
    await userEvent.click(tela.getByRole('button', { name: 'Apagar tudo' }));
    await expect(await tela.findByRole('button', { name: 'Apagando…' })).toHaveAttribute('aria-busy', 'true');
  },
};

export const Cancelar: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancelar' }));
    await expect(args.aoFechar).toHaveBeenCalledOnce();
  },
};
