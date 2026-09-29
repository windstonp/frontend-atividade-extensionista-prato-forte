import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './Button';
import { Sheet } from './Sheet';

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  args: {
    aberta: true,
    aoFechar: fn(),
    titulo: 'Trocar o arroz',
    descricao: 'Opções com a mesma energia.',
    children: (
      <div className="mt-5 flex flex-col gap-3">
        <Button variante="contorno">Batata-doce</Button>
        <Button variante="contorno">Cuscuz</Button>
      </div>
    ),
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Aberta: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    const dialogo = tela.getByRole('dialog', { name: 'Trocar o arroz' });
    await waitFor(() => expect(dialogo).toHaveFocus());

    await userEvent.tab();
    await expect(tela.getByRole('button', { name: 'Batata-doce' })).toHaveFocus();
    await userEvent.tab();
    await expect(tela.getByRole('button', { name: 'Cuscuz' })).toHaveFocus();
    await userEvent.tab(); // o foco volta ao começo, sem sair da folha
    await expect(tela.getByRole('button', { name: 'Batata-doce' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(args.aoFechar).toHaveBeenCalled();
  },
};

export const Destrutiva: Story = {
  args: {
    tom: 'destrutivo',
    titulo: 'Apagar sua conta?',
    descricao: 'Isto apaga seus dados de vez.',
    children: <Button variante="destrutiva" className="mt-5">Apagar tudo</Button>,
  },
  play: async ({ canvasElement }) => {
    const titulo = within(canvasElement).getByRole('heading', { name: 'Apagar sua conta?' });
    await expect(titulo).toHaveClass('text-alerta');
  },
};

export const Fechada: Story = {
  args: { aberta: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('dialog')).toBeNull();
  },
};
