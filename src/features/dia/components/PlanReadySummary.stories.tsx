import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { PlanReadySummary } from './PlanReadySummary';

const refeicoes = [
  { slot: 'cafe', time: '06:40', name: 'Café da manhã', calories: 420 },
  { slot: 'lanche', time: '09:30', name: 'Lanche', calories: 230 },
  { slot: 'almoco', time: '12:30', name: 'Almoço', calories: 640 },
  { slot: 'pre-treino', time: '17:30', name: 'Pré-treino', calories: 310 },
  { slot: 'jantar', time: '21:00', name: 'Jantar', calories: 500 },
] as const;

const meta = {
  title: 'Plano/PlanReadySummary',
  component: PlanReadySummary,
  args: { refeicoes: [...refeicoes], metas: { kcal: 2100, proteinG: 118, carbsG: 245, fatG: 62 } },
} satisfies Meta<typeof PlanReadySummary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const UmDiaComum: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Um dia comum' })).toBeInTheDocument();
    await expect(c.getByText('Pré-treino')).toBeInTheDocument();
    await expect(canvasElement).toHaveTextContent('118 g proteína');
  },
};
