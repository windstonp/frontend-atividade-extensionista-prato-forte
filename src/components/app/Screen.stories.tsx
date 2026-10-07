import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { Screen } from './Screen';

const meta = {
  title: 'App/Screen',
  component: Screen,
  args: { children: <main className="p-6"><h1 className="font-display text-2xl font-bold">Hoje</h1></main> },
} satisfies Meta<typeof Screen>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Clara: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: 'Hoje' })).toBeInTheDocument();
  },
};
export const Escura: Story = { args: { escura: true } };
