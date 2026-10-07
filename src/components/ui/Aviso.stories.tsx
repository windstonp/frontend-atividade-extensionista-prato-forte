import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { Aviso } from './Aviso';

const meta = {
  title: 'UI/Aviso',
  component: Aviso,
  args: { tom: 'gema', children: 'Fica 8 g de proteína abaixo do jantar original.' },
} satisfies Meta<typeof Aviso>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Gema: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Fica 8 g de proteína abaixo do jantar original.');
  },
};
export const Mata: Story = { args: { tom: 'mata', children: 'Plano novo pronto.' } };
export const Alerta: Story = {
  args: { tom: 'alerta', titulo: 'Sua pergunta não saiu daqui', children: 'O aparelho está sem internet.' },
  play: async ({ canvasElement }) => {
    const aviso = within(canvasElement).getByRole('alert');
    await expect(aviso).toHaveTextContent('Sua pergunta não saiu daqui');
    await expect(aviso).toHaveTextContent('O aparelho está sem internet.');
  },
};
export const ComTitulo: Story = { args: { titulo: 'Você já registrou hoje', children: 'Salvar vai atualizar o valor.' } };
