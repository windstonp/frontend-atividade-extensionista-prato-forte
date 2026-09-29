import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Chip, ChipRemovivel } from './Chip';

const meta = { title: 'UI/Chip', component: Chip, args: { marcado: false, onClick: fn(), children: 'Ovos' } } satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desmarcado: Story = {
  play: async ({ canvasElement, args }) => {
    const chip = within(canvasElement).getByRole('button', { name: 'Ovos' });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Marcado: Story = { args: { marcado: true } };

const remover = fn();

export const Removivel: Story = {
  render: () => <ChipRemovivel aoRemover={remover}>camarão</ChipRemovivel>,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remover camarão' }));
    await expect(remover).toHaveBeenCalledOnce();
  },
};
