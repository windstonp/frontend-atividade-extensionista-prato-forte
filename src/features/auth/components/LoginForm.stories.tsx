import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ApiError } from '@/lib/api/errors';
import { LoginForm } from './LoginForm';

type Tela = ReturnType<typeof within>;

async function preencher(tela: Tela) {
  await userEvent.type(tela.getByLabelText('E-mail'), 'camila@exemplo.com');
  await userEvent.type(tela.getByLabelText('Senha'), 'senha1234');
}

const meta = {
  title: 'Conta/LoginForm',
  component: LoginForm,
  args: { aoEnviar: fn(async () => undefined) },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(tela.getByText('Confira o e-mail.')).toBeVisible());
    await waitFor(() => expect(tela.getByText('Digite sua senha.')).toBeVisible());
    await expect(args.aoEnviar).not.toHaveBeenCalled();
  },
};

export const CredenciaisInvalidas: Story = {
  args: {
    aoEnviar: fn(async () => {
      throw new ApiError(422, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');
    }),
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await preencher(tela);
    await userEvent.click(tela.getByRole('button', { name: 'Entrar' }));
    await expect(await tela.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
    await waitFor(() => expect(tela.getByLabelText('E-mail')).toHaveFocus());
  },
};

export const MuitasTentativas: Story = {
  args: {
    aoEnviar: fn(async () => {
      throw new ApiError(429, 'TOO_MANY_REQUESTS', 'Muitas tentativas seguidas. Tente de novo em 40 segundos.', {}, { retryAfter: 40 });
    }),
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await preencher(tela);
    await userEvent.click(tela.getByRole('button', { name: 'Entrar' }));
    await expect(await tela.findByRole('alert')).toHaveTextContent('Tente de novo em 40 segundos.');
  },
};

export const Enviando: Story = {
  args: { aoEnviar: fn(() => new Promise<never>(() => {})) },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await preencher(tela);
    await userEvent.click(tela.getByRole('button', { name: 'Entrar' }));
    await expect(await tela.findByRole('button', { name: 'Entrando…' })).toHaveAttribute('aria-busy', 'true');
  },
};

export const ComEmailDoCadastro: Story = {
  args: { emailInicial: 'camila@exemplo.com' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('E-mail')).toHaveValue('camila@exemplo.com');
  },
};
