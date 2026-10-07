import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DayToggleGroup } from './DayToggleGroup';

const meta = { title: 'Onboarding/DayToggleGroup', component: DayToggleGroup, args: { dias: [1, 3, 5], aoMudar: fn() } } satisfies Meta<typeof DayToggleGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'segunda' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(c.getByRole('button', { name: 'terça' }));
    await expect(args.aoMudar).toHaveBeenLastCalledWith([1, 3, 5, 2]);
    await userEvent.click(c.getByRole('button', { name: 'segunda' }));
    await expect(args.aoMudar).toHaveBeenLastCalledWith([3, 5]);
  },
};

export const NenhumDia: Story = {
  args: { dias: [] },
  play: async ({ canvasElement }) => {
    for (const b of within(canvasElement).getAllByRole('button')) await expect(b).toHaveAttribute('aria-pressed', 'false');
  },
};
