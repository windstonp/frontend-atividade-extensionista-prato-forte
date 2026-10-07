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
    const c = within(canvasElement);
    // Sem disabled de verdade: o foco não cai para o <body> no meio de um salvamento.
    await expect(c.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
    const quilo = c.getByRole('radio', { name: 'Quilo e centímetro' });
    quilo.focus();
    await userEvent.click(c.getByRole('radio', { name: 'Libra e polegada' }));
    await expect(args.aoMudar).not.toHaveBeenCalled();
    await expect(c.getByRole('radio', { name: 'Libra e polegada' })).not.toBeDisabled();
  },
};
