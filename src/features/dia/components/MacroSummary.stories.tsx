import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { MacroSummary } from './MacroSummary';

const meta = { title: 'Plano/MacroSummary', component: MacroSummary, args: { proteinG: 118, carbsG: 245, fatG: 62 } } satisfies Meta<typeof MacroSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent('118 g proteína');
    await expect(within(canvasElement).getByText(/245 g/)).toBeInTheDocument();
  },
};
