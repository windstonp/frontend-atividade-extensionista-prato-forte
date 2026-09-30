import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { pesagensApi } from '@/mocks/fixtures/progresso';
import type { Pesagem } from '../tipos';
import { HistoricoPesagens } from './HistoricoPesagens';

const meta = { title: 'Evolução/HistoricoPesagens', component: HistoricoPesagens, args: { pesagens: camelizar<Pesagem[]>(pesagensApi) } } satisfies Meta<typeof HistoricoPesagens>;
export default meta;
type Story = StoryObj<typeof meta>;

export const QuatroUltimas: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    const itens = tela.getAllByRole('listitem');
    await expect(itens).toHaveLength(4);
    await expect(itens[0]).toHaveTextContent('15 de setembro58,4 kg+400 g');
  },
};

export const SoAPrimeira: Story = {
  args: { pesagens: [{ id: 1, date: '2026-09-28', weightKg: 58.4 }] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('início')).toBeInTheDocument();
  },
};

export const Vazio: Story = {
  args: { pesagens: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('list')).toBeNull();
  },
};
