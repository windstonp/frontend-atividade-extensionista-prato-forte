import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LikertQuestion } from './LikertQuestion';

const ESCALA = ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'];

const meta = {
  title: 'Validação/LikertQuestion',
  component: LikertQuestion,
  args: { rotulo: 'Eu usaria o Prato Forte com frequência.', opcoes: ESCALA, valor: null, aoEscolher: fn() },
  render: function Controlado(args) {
    const [valor, setValor] = useState(args.valor);
    return <LikertQuestion {...args} valor={valor} aoEscolher={(n) => { setValor(n); args.aoEscolher(n); }} />;
  },
} satisfies Meta<typeof LikertQuestion>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SemResposta: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('radiogroup', { name: 'Eu usaria o Prato Forte com frequência.' })).toBeInTheDocument();
    await expect(tela.getAllByRole('radio').filter((r) => r.getAttribute('aria-checked') === 'true')).toHaveLength(0);
  },
};

export const Respondida: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('radio', { name: 'Concordo' }));
    await expect(args.aoEscolher).toHaveBeenCalledWith(4);
  },
};

export const Setas: Story = {
  args: { valor: 3 },
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    tela.getByRole('radio', { name: 'Neutro' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(args.aoEscolher).toHaveBeenLastCalledWith(4);
    await expect(tela.getByRole('radio', { name: 'Concordo' })).toHaveFocus();
  },
};
