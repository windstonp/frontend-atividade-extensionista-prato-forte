import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { semanaDe } from '../regras';
import { WeekDayPicker } from './WeekDayPicker';

const dias = semanaDe('2026-09-30');

const meta = {
  title: 'Dia/WeekDayPicker',
  component: WeekDayPicker,
  args: { dias, hoje: '2026-09-30', selecionado: '2026-09-30', aoEscolher: fn() },
  render: function Controlado(args) {
    const [selecionado, setSelecionado] = useState(args.selecionado);
    return (
      <WeekDayPicker
        {...args}
        selecionado={selecionado}
        aoEscolher={(d) => {
          setSelecionado(d);
          args.aoEscolher(d);
        }}
      />
    );
  },
} satisfies Meta<typeof WeekDayPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HojeSelecionado: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    const hoje = tela.getByRole('tab', { name: /qua 30/ });
    await expect(hoje).toHaveAttribute('aria-selected', 'true');
    await expect(hoje).toHaveAttribute('tabindex', '0');
    await expect(tela.getByRole('tab', { name: /seg 28/ })).toHaveAttribute('tabindex', '-1');

    hoje.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.aoEscolher).toHaveBeenCalledWith('2026-10-01');
    await expect(tela.getByRole('tab', { name: /qui 1/ })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(tela.getByRole('tab', { name: /seg 28/ })).toHaveFocus();
  },
};

export const OutroDia: Story = {
  args: { selecionado: '2026-10-04' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('tab', { name: /dom 4/ })).toHaveAttribute('aria-selected', 'true');
  },
};
