import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { EsqueletoDoDia, Skeleton } from './Skeleton';

const meta = { title: 'UI/Skeleton', component: Skeleton, args: { className: 'h-24 w-full' } } satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Bloco: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[aria-hidden="true"]')).not.toBeNull();
  },
};
export const Dia: Story = { render: () => <EsqueletoDoDia /> };
