import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ApiError } from '@/lib/api/errors';
import { ForgotPasswordForm } from './ForgotPasswordForm';

const meta = {
  title: 'Conta/ForgotPasswordForm',
  component: ForgotPasswordForm,
  args: { aoEnviar: fn(async () => undefined) },
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Enviar link' }));
    await waitFor(() => expect(tela.getByText('Confira o e-mail.')).toBeVisible());
    await expect(args.aoEnviar).not.toHaveBeenCalled();
  },
};

export const Enviado: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.type(tela.getByLabelText('E-mail'), 'camila@exemplo.com');
    await userEvent.click(tela.getByRole('button', { name: 'Enviar link' }));
    await expect(args.aoEnviar).toHaveBeenCalledWith('camila@exemplo.com');
    const titulo = await tela.findByRole('heading', { name: 'Confira seu e-mail' });
    await waitFor(() => expect(titulo).toBeVisible());
    await expect(tela.getByRole('link', { name: 'Voltar para entrar' })).toHaveAttribute('href', '/entrar');
  },
};

export const MuitasTentativas: Story = {
  args: {
    aoEnviar: fn(async () => {
      throw new ApiError(429, 'TOO_MANY_REQUESTS', 'Muitas tentativas seguidas. Tente de novo em 1200 segundos.');
    }),
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.type(tela.getByLabelText('E-mail'), 'camila@exemplo.com');
    await userEvent.click(tela.getByRole('button', { name: 'Enviar link' }));
    await expect(await tela.findByRole('alert')).toHaveTextContent('Muitas tentativas seguidas.');
  },
};
