import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { progressoApi } from '@/mocks/fixtures/progresso';
import type { Progresso } from '../tipos';
import { WeightChart } from './WeightChart';

const de = (parcial: Parameters<typeof progressoApi>[0] = {}) => camelizar<Progresso>(progressoApi(parcial)).weight;

const meta = { title: 'Evolução/WeightChart', component: WeightChart, args: { peso: de() } } satisfies Meta<typeof WeightChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SeisPesagens: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('img', { name: 'Peso de 56,8 kg para 58,4 kg, com meta de 62,0 kg' })).toBeInTheDocument();
    await expect(tela.getByText('+1,6 kg em 5 semanas')).toBeInTheDocument();
    await expect(tela.getByText('meta 62,0 kg')).toBeInTheDocument();
    await expect(tela.getByText('No ritmo das últimas semanas, você chega na meta por volta do início de dezembro.')).toBeInTheDocument();
  },
};

export const UmaPesagem: Story = {
  args: { peso: de({ pontos: [['2026-09-28', 58.4]], previsao: false }) },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('primeira pesagem')).toBeInTheDocument();
    await expect(tela.getByText('Registre mais uma pesagem para estimar quando você chega na meta.')).toBeInTheDocument();
  },
};

export const SemMeta: Story = {
  args: { peso: de({ meta: null }) },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('img', { name: 'Peso de 56,8 kg para 58,4 kg' })).toBeInTheDocument();
    await expect(tela.queryByText(/^meta /)).toBeNull();
    await expect(tela.queryByText(/chega na meta/)).toBeNull();
  },
};

export const Perda: Story = {
  args: { peso: de({ pontos: [['2026-08-11', 73.2], ['2026-08-25', 72.5], ['2026-09-15', 71.6]], meta: 68 }) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('−1,6 kg em 5 semanas')).toBeInTheDocument();
  },
};

export const MuitosPontos: Story = {
  args: {
    peso: de({ pontos: Array.from({ length: 40 }, (_, i) => [new Date(Date.UTC(2026, 0, 1 + i * 7)).toISOString().slice(0, 10), 60 + i * 0.1] as const) }),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-rotulo-data]')).toHaveLength(6);
  },
};
