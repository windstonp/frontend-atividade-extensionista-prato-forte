import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { GoalCard } from './GoalCard';

const meta = {
  title: 'Perfil/GoalCard',
  component: GoalCard,
  args: {
    objetivo: 'ganhar-massa',
    rotuloObjetivo: 'Ganhar massa magra',
    inicioKg: 56.8,
    atualKg: 58.4,
    metaKg: 62,
    origemMeta: 'user',
    rotuloAtividade: '3 ou 4 vezes na semana',
    academia: 'Zfit',
    cidade: 'Capivari de Baixo',
  },
} satisfies Meta<typeof GoalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComMeta: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('58,4 kg hoje')).toBeInTheDocument();
    await expect(tela.getByText('meta 62,0 kg')).toBeInTheDocument();
    await expect(tela.getByRole('link', { name: 'Trocar objetivo' })).toHaveAttribute('href', '/onboarding/objetivo?editar=1');
  },
};

export const MetaSugerida: Story = {
  args: { origemMeta: 'suggested', metaKg: 61.5 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('meta sugerida 61,5 kg')).toBeInTheDocument();
  },
};

export const SemMeta: Story = {
  args: { objetivo: 'mais-disposicao', rotuloObjetivo: 'Ter mais disposição', metaKg: null, origemMeta: null },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('heading', { name: 'Ter mais disposição' })).toBeInTheDocument();
    await expect(tela.queryByText(/hoje$/)).toBeNull();
  },
};

export const ManterPeso: Story = {
  args: { objetivo: 'manter-peso', rotuloObjetivo: 'Manter o peso', inicioKg: 70, atualKg: 70, metaKg: 70, origemMeta: 'auto' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[style*="NaN"]')).toHaveLength(0);
  },
};
