import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toggle } from './Toggle';

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  args: { ligado: false, onChange: fn(), rotulo: 'Lembrete de refeição', descricao: '15 minutos antes de cada horário' },
  render: function Controlado(args) {
    const [ligado, setLigado] = useState(args.ligado);
    return <Toggle {...args} ligado={ligado} onChange={(v) => { setLigado(v); args.onChange(v); }} />;
  },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Desligado: Story = {
  play: async ({ canvasElement, args }) => {
    const chave = within(canvasElement).getByRole('switch', { name: 'Lembrete de refeição' });
    await expect(chave).toHaveAttribute('aria-checked', 'false');
    await expect(chave).toHaveAccessibleDescription('15 minutos antes de cada horário');
    await userEvent.click(chave);
    await expect(args.onChange).toHaveBeenCalledWith(true);
    await expect(chave).toHaveAttribute('aria-checked', 'true');
  },
};

export const Ligado: Story = { args: { ligado: true } };

export const Desabilitado: Story = {
  args: { desabilitado: true },
  play: async ({ canvasElement, args }) => {
    const chave = within(canvasElement).getByRole('switch');
    await expect(chave).toBeDisabled();
    await userEvent.click(chave);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
