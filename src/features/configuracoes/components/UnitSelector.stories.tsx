import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { UnitSelector } from './UnitSelector';

const meta = { title: 'Configurações/UnitSelector', component: UnitSelector, args: { valor: 'metric', salvando: false, aoMudar: fn() } } satisfies Meta<typeof UnitSelector>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Metrico: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('radio', { name: 'Libra e polegada' }));
    await expect(args.aoMudar).toHaveBeenCalledWith('imperial');
  },
};
export const Imperial: Story = { args: { valor: 'imperial' } };
export const Salvando: Story = {
  args: { salvando: true },
  play: async ({ canvasElement, args }) => {
    const libra = within(canvasElement).getByRole('radio', { name: 'Libra e polegada' });
    await expect(libra).toBeDisabled();
    await userEvent.click(libra, { pointerEventsCheck: 0 });
    await expect(args.aoMudar).not.toHaveBeenCalled();
  },
};
