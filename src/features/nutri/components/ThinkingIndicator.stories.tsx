import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ThinkingIndicator } from './ThinkingIndicator';

const meta = { title: 'Nutri/ThinkingIndicator', component: ThinkingIndicator } satisfies Meta<typeof ThinkingIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Anuncia: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('O Nutri está montando a resposta');
  },
};
