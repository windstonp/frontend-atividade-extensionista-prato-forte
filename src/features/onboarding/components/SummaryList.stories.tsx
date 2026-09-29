import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { SummaryList } from './SummaryList';

const meta = {
  title: 'Onboarding/SummaryList',
  component: SummaryList,
  args: {
    linhas: [
      { etapa: 'objetivo', rotulo: 'Objetivo', valor: 'Ganhar massa magra' },
      { etapa: 'restricoes', rotulo: 'Restrições', valor: 'Amendoim e castanhas', alerta: true },
    ],
  },
} satisfies Meta<typeof SummaryList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComAlergia: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('Amendoim e castanhas')).toHaveClass('text-alerta');
    await expect(tela.getByRole('link', { name: 'Editar objetivo' })).toHaveAttribute('href', '/onboarding/objetivo?de=resumo');
  },
};
