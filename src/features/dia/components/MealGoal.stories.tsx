import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { MealGoal } from './MealGoal';

const meta = { calories: 450, protein: 25, carbs: 60, fat: 12 };
const zero = { calories: 0, protein: 0, carbs: 0, fat: 0 };

const m = {
  title: 'Dia/MealGoal',
  component: MealGoal,
  args: { meta, consumido: zero, temRegistro: false },
  decorators: [(Story) => <div className="bg-papel p-5"><Story /></div>],
} satisfies Meta<typeof MealGoal>;
export default m;
type Story = StoryObj<typeof m>;

export const Vazia: Story = {
  play: async ({ canvasElement }) => {
    const t = within(canvasElement);
    await expect(t.getByRole('meter')).toHaveAttribute('aria-valuetext', 'Nada registrado ainda.');
    await expect(t.getByText('meta 450')).toBeInTheDocument();
  },
};
export const Abaixo: Story = {
  args: { consumido: { calories: 288, protein: 0, carbs: 72, fat: 0 }, temRegistro: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('meter')).toHaveAttribute('aria-valuenow', '288');
    await expect(within(canvasElement).getAllByText('Faltam 162 kcal e 25 g de proteína.').length).toBeGreaterThan(0);
  },
};
export const NaFaixa: Story = { args: { consumido: { calories: 430, protein: 24, carbs: 55, fat: 11 }, temRegistro: true } };
export const Acima: Story = {
  args: { consumido: { calories: 560, protein: 30, carbs: 70, fat: 11 }, temRegistro: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('meter')).toHaveAttribute('aria-valuetext', 'Meta batida. 110 kcal acima da sugestão.');
  },
};
export const MovimentoReduzido: Story = { ...NaFaixa, globals: { movimento: 'reduzido' } };
