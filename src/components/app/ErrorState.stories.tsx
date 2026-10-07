import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ErrorState } from './ErrorState';

const meta = {
  title: 'App/ErrorState',
  component: ErrorState,
  args: { titulo: 'Não deu para carregar seu plano', descricao: 'Confira a internet e tente de novo.' },
} satisfies Meta<typeof ErrorState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ComTentar: Story = {
  args: { aoTentarDeNovo: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Tentar de novo' }));
    await expect(args.aoTentarDeNovo).toHaveBeenCalled();
  },
};
export const SemTentar: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};
