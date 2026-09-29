import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ApiError, MENSAGEM_SEM_CONEXAO } from '@/lib/api/errors';
import { RegisterForm } from './RegisterForm';

type Tela = ReturnType<typeof within>;

async function preencher(tela: Tela) {
  await userEvent.type(tela.getByLabelText('Nome completo'), 'Camila Réus');
  await userEvent.type(tela.getByLabelText('E-mail'), 'camila.reus@gmail.com');
  await userEvent.type(tela.getByLabelText('Senha'), 'senha1234');
  await userEvent.click(tela.getByRole('checkbox', { name: /Li e aceito/ }));
}

const meta = {
  title: 'Conta/RegisterForm',
  component: RegisterForm,
  args: { aoEnviar: fn(async () => undefined) },
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Criar conta' }));
    await waitFor(() => expect(tela.getByText('Escreva seu nome.')).toBeVisible());
    await waitFor(() => expect(tela.getByText('Confira o e-mail.')).toBeVisible());
    await waitFor(() => expect(tela.getByText('Use 8 ou mais caracteres, com letra e número.')).toBeVisible());
    await waitFor(() => expect(tela.getByText('Para continuar, aceite o termo.')).toBeVisible());
    await expect(args.aoEnviar).not.toHaveBeenCalled();
  },
};

export const Preenchido: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await preencher(tela);
    await userEvent.click(tela.getByRole('button', { name: 'Criar conta' }));
    await expect(args.aoEnviar).toHaveBeenCalledWith({
      name: 'Camila Réus',
      email: 'camila.reus@gmail.com',
      password: 'senha1234',
      termsAccepted: true,
    });
  },
};

export const Enviando: Story = {
  args: { aoEnviar: fn(() => new Promise<never>(() => {})) },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await preencher(tela);
    await userEvent.click(tela.getByRole('button', { name: 'Criar conta' }));
    const botao = await tela.findByRole('button', { name: 'Criando…' });
    await expect(botao).toHaveAttribute('aria-busy', 'true');
    await expect(tela.getByLabelText('E-mail')).toBeDisabled();
  },
};

export const ErroDeCampo: Story = {
  args: {
    aoEnviar: fn(async () => {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', { email: ['Esse e-mail já tem conta.'] });
    }),
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await preencher(tela);
    await userEvent.click(tela.getByRole('button', { name: 'Criar conta' }));
    await waitFor(() => expect(tela.getByText('Esse e-mail já tem conta.')).toBeVisible());
    await expect(tela.getByRole('link', { name: 'Entrar com este e-mail' })).toHaveAttribute(
      'href',
      '/entrar?email=camila.reus%40gmail.com',
    );
  },
};

export const ErroGeral: Story = {
  args: {
    aoEnviar: fn(async () => {
      throw new ApiError(0, 'NETWORK_ERROR', MENSAGEM_SEM_CONEXAO);
    }),
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await preencher(tela);
    await userEvent.click(tela.getByRole('button', { name: 'Criar conta' }));
    await expect(await tela.findByRole('alert')).toHaveTextContent(MENSAGEM_SEM_CONEXAO);
    await expect(tela.getByRole('button', { name: 'Criar conta' })).toBeEnabled();
  },
};

export const LerOTermo: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Ler o termo' }));
    await expect(await tela.findByRole('dialog', { name: 'Termo de uso dos seus dados' })).toBeVisible();
  },
};
