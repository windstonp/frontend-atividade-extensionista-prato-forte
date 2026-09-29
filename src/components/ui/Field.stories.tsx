import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field } from './Field';

const meta = {
  title: 'UI/Field',
  component: Field,
  args: { id: 'email', label: 'E-mail', type: 'email' },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {
  play: async ({ canvasElement }) => {
    const campo = within(canvasElement).getByLabelText('E-mail');
    await userEvent.type(campo, 'camila@exemplo.com');
    await expect(campo).toHaveValue('camila@exemplo.com');
    await expect(campo).not.toHaveAttribute('aria-invalid');
  },
};

export const ComSufixo: Story = { args: { id: 'peso', label: 'Peso', sufixo: 'kg', inputMode: 'decimal', defaultValue: '58,4' } };

export const ComAjuda: Story = {
  args: { id: 'senha', label: 'Senha', type: 'password', ajuda: '8 ou mais, com letra e número' },
  play: async ({ canvasElement }) => {
    const campo = within(canvasElement).getByLabelText('Senha');
    await expect(campo).toHaveAttribute('aria-describedby', 'senha-ajuda');
  },
};

export const ComErro: Story = {
  args: { defaultValue: 'camila@', erro: 'Confira o e-mail.', ajuda: 'O mesmo que você usa no celular' },
  play: async ({ canvasElement }) => {
    const campo = within(canvasElement).getByLabelText('E-mail');
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
    await expect(campo).toHaveAttribute('aria-describedby', 'email-ajuda email-mensagem');
    await expect(within(canvasElement).getByText('Confira o e-mail.')).toHaveAttribute('id', 'email-mensagem');
  },
};

export const ComAviso: Story = {
  args: { id: 'meta', label: 'Meta de peso', sufixo: 'kg', defaultValue: '45', aviso: 'Essa meta fica abaixo da faixa saudável para a sua altura.' },
};

export const Desabilitado: Story = { args: { disabled: true, defaultValue: 'camila@exemplo.com' } };
