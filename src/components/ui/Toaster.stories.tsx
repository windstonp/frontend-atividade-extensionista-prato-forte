import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './Button';
import { Toaster, useToast } from './Toaster';

function Disparador({ comAcao }: { comAcao?: () => void }) {
  const avisar = useToast();
  return (
    <Button
      onClick={() =>
        avisar({ texto: 'Senha trocada.', acao: comAcao ? { rotulo: 'Desfazer', onClick: comAcao } : undefined })
      }
    >
      Avisar
    </Button>
  );
}

const meta = {
  title: 'UI/Toaster',
  component: Toaster,
  args: { children: null },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Aviso: Story = {
  render: () => (
    <Toaster>
      <Disparador />
    </Toaster>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Avisar' }));
    await expect(await tela.findByRole('status')).toHaveTextContent('Senha trocada.');
  },
};

const desfazer = fn();

export const ComDesfazer: Story = {
  render: () => (
    <Toaster>
      <Disparador comAcao={desfazer} />
    </Toaster>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Avisar' }));
    await userEvent.click(await tela.findByRole('button', { name: 'Desfazer' }));
    await expect(desfazer).toHaveBeenCalledOnce();
  },
};

export const FechaAoTocar: Story = {
  render: () => (
    <Toaster>
      <Disparador />
    </Toaster>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Avisar' }));
    await userEvent.click(await tela.findByText('Senha trocada.'));
    await waitFor(() => expect(tela.queryByRole('status')).toBeNull());
  },
};

const desfazerSemFechar = fn();

export const FechaPeloBotao: Story = {
  render: () => (
    <Toaster>
      <Disparador comAcao={desfazerSemFechar} />
    </Toaster>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Avisar' }));
    const fechar = await tela.findByRole('button', { name: 'Fechar aviso' });
    fechar.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(tela.queryByRole('status')).toBeNull());
    await expect(desfazerSemFechar).not.toHaveBeenCalled();
  },
};
