import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Criar conta', onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primaria: Story = {
  play: async ({ canvasElement, args }) => {
    const botao = within(canvasElement).getByRole('button', { name: 'Criar conta' });
    await expect(botao).toHaveAttribute('type', 'button');
    await userEvent.click(botao);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Contorno: Story = { args: { variante: 'contorno' } };

export const ContornoEscuro: Story = {
  args: { variante: 'contorno-escuro', children: 'Já tenho conta' },
  decorators: [(Historia) => <div className="rounded-3xl bg-tinta p-5"><Historia /></div>],
};

export const Texto: Story = { args: { variante: 'texto', tamanho: 'media', children: 'Esqueci minha senha' } };

export const Destrutiva: Story = { args: { variante: 'destrutiva', children: 'Apagar tudo' } };

export const Desabilitado: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const botao = within(canvasElement).getByRole('button', { name: 'Criar conta' });
    await expect(botao).toBeDisabled();
    await userEvent.click(botao, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Carregando: Story = {
  args: { carregando: true, rotuloCarregando: 'Criando…' },
  play: async ({ canvasElement, args }) => {
    const botao = within(canvasElement).getByRole('button', { name: 'Criando…' });
    await expect(botao).toHaveAttribute('aria-busy', 'true');
    await expect(botao).toBeDisabled();
    await userEvent.click(botao, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <Button {...args}>Grande</Button>
      <Button {...args} tamanho="media">Média</Button>
      <Button {...args} tamanho="pequena">Pequena</Button>
    </div>
  ),
};
