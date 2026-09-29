import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { PasswordField } from './PasswordField';

const meta = {
  title: 'UI/PasswordField',
  component: PasswordField,
  args: { id: 'senha', label: 'Senha', autoComplete: 'new-password', ajuda: '8 ou mais, com letra e número' },
} satisfies Meta<typeof PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Alternar: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const campo = tela.getByLabelText('Senha');
    await userEvent.type(campo, 'senha1234');
    await expect(campo).toHaveAttribute('type', 'password');

    await userEvent.click(tela.getByRole('button', { name: 'Mostrar senha' }));
    await expect(campo).toHaveAttribute('type', 'text');
    await expect(tela.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(tela.getByRole('button', { name: 'Ocultar senha' }));
    await expect(campo).toHaveAttribute('type', 'password');
  },
};

export const ComErro: Story = { args: { erro: 'Use 8 ou mais caracteres, com letra e número.' } };
