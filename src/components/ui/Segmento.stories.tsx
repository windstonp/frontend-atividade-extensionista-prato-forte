import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Segmento } from './Field';

const OPCOES = [
  { valor: 'feminino', rotulo: 'Feminino' },
  { valor: 'masculino', rotulo: 'Masculino' },
  { valor: 'nao-dizer', rotulo: 'Prefiro não dizer' },
];

function Controlado({ inicial = null, erro }: { inicial?: string | null; erro?: string }) {
  const [valor, setValor] = useState<string | null>(inicial);
  return <Segmento label="Sexo biológico" opcoes={OPCOES} valor={valor} onChange={setValor} erro={erro} />;
}

const meta = { title: 'UI/Segmento', component: Controlado } satisfies Meta<typeof Controlado>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SemEscolha: Story = {
  play: async ({ canvasElement }) => {
    const opcoes = within(canvasElement).getAllByRole('radio');
    await expect(opcoes.map((o) => o.getAttribute('aria-checked'))).toEqual(['false', 'false', 'false']);
    await expect(opcoes[0]).toHaveAttribute('tabindex', '0');
  },
};

export const Setas: Story = {
  args: { inicial: 'feminino' },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    tela.getByRole('radio', { name: 'Feminino' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(tela.getByRole('radio', { name: 'Masculino' })).toHaveAttribute('aria-checked', 'true');
    await expect(tela.getByRole('radio', { name: 'Masculino' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(tela.getByRole('radio', { name: 'Prefiro não dizer' })).toHaveAttribute('aria-checked', 'true');
  },
};

export const ComErro: Story = {
  args: { erro: 'Escolha uma opção.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Escolha uma opção.')).toBeInTheDocument();
  },
};
