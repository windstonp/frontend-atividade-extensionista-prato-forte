import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { progressoApi } from '@/mocks/fixtures/progresso';
import type { Progresso } from '../tipos';
import { MediasDoPeriodo } from './MediasDoPeriodo';

const meta = {
  title: 'Evolução/MediasDoPeriodo',
  component: MediasDoPeriodo,
  args: { medias: camelizar<Progresso>(progressoApi()).averages },
} satisfies Meta<typeof MediasDoPeriodo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ComObservacao: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('heading', { name: 'Média por dia neste período' })).toBeInTheDocument();
    await expect(tela.getByText('Você fica um pouco abaixo da meta de proteína nos dias sem treino.')).toBeInTheDocument();
  },
};

export const Vazio: Story = {
  args: { medias: camelizar<Progresso>(progressoApi({ semMedias: true })).averages },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Marque suas refeições para ver suas médias aqui.')).toBeInTheDocument();
  },
};

export const SemMeta: Story = {
  args: (() => {
    const medias = camelizar<Progresso>(progressoApi()).averages;
    return { medias: { ...medias, protein: { ...medias.protein, targetG: null }, calories: { ...medias.calories, targetKcal: null } } };
  })(),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).not.toMatch(/\d\/\d/);
  },
};
