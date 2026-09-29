import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ApiError, MENSAGEM_ERRO_SERVIDOR, MENSAGEM_SEM_CONEXAO } from '@/lib/api/errors';
import { FormError } from './FormError';

const meta = { title: 'UI/FormError', component: FormError } satisfies Meta<typeof FormError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rede: Story = {
  args: { erro: new ApiError(0, 'NETWORK_ERROR', MENSAGEM_SEM_CONEXAO) },
  play: async ({ canvasElement }) => {
    const alerta = within(canvasElement).getByRole('alert');
    await expect(alerta).toHaveTextContent(MENSAGEM_SEM_CONEXAO);
    await waitFor(() => expect(alerta).toHaveFocus());
  },
};

export const Servidor: Story = { args: { erro: new ApiError(500, 'SERVER_ERROR', MENSAGEM_ERRO_SERVIDOR) } };

export const Credenciais: Story = {
  args: { erro: new ApiError(422, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.'), focar: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).not.toHaveFocus();
  },
};

export const MuitasTentativas: Story = {
  args: { erro: new ApiError(429, 'TOO_MANY_REQUESTS', 'Muitas tentativas seguidas. Tente de novo em 40 segundos.') },
};

export const ComTentarDeNovo: Story = {
  args: { erro: MENSAGEM_SEM_CONEXAO, aoTentarDeNovo: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Tentar de novo' }));
    await expect(args.aoTentarDeNovo).toHaveBeenCalledOnce();
  },
};

export const SemErro: Story = {
  args: { erro: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('alert')).toBeNull();
  },
};
