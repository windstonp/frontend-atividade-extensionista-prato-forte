import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { progressoApi } from '@/mocks/fixtures/progresso';
import type { Constancia, Progresso, StatusDia } from '../tipos';
import { AdherenceGrid } from './AdherenceGrid';

const padrao = camelizar<Progresso>(progressoApi()).adherence;

const meta = { title: 'Evolução/AdherenceGrid', component: AdherenceGrid, args: { constancia: padrao } } satisfies Meta<typeof AdherenceGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PadraoDoMock: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getAllByRole('img')).toHaveLength(28);
    await expect(tela.getByRole('img', { name: '15 de setembro: hoje' })).toBeInTheDocument();
    await expect(tela.getByText('21 dias')).toBeInTheDocument();
    await expect(tela.getByText(/Sua sequência atual é de 3 dias\./)).toBeInTheDocument();
  },
};

export const TodoVazio: Story = {
  args: {
    constancia: { days: padrao.days.map((d, i) => ({ ...d, status: (i === 27 ? 'hoje' : 'vazio') as StatusDia })), completeDays: 0, streak: 0 } satisfies Constancia,
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('0 dias')).toBeInTheDocument();
    await expect(tela.queryByText(/sequência/)).toBeNull();
  },
};

export const SequenciaLonga: Story = {
  args: { constancia: { days: padrao.days.map((d, i) => ({ ...d, status: (i === 27 ? 'hoje' : 'completo') as StatusDia })), completeDays: 27, streak: 27 } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Sua sequência atual é de 27 dias\./)).toBeInTheDocument();
  },
};
