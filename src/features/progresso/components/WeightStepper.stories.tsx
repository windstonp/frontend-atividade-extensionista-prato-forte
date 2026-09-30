import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IMPERIAL } from '@/lib/units';
import { WeightStepper } from './WeightStepper';

const meta = {
  title: 'Evolução/WeightStepper',
  component: WeightStepper,
  args: { valor: 58.4, base: 58.4, aoMudar: fn() },
  render: function Controlado(args) {
    const [valor, setValor] = useState(args.valor);
    return <WeightStepper {...args} valor={valor} aoMudar={(v) => { setValor(v); args.aoMudar(v); }} />;
  },
} satisfies Meta<typeof WeightStepper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inicial: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Digitar o peso: 58,4 kg' })).toBeInTheDocument();
  },
};

export const Ajustando: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Aumentar 100 gramas' }));
    await userEvent.click(tela.getByRole('button', { name: 'Aumentar 100 gramas' }));
    await userEvent.click(tela.getByRole('button', { name: 'Diminuir 100 gramas' }));
    await expect(args.aoMudar).toHaveBeenLastCalledWith(58.5);
  },
};

export const ForaDaRegua: Story = {
  args: { valor: 61, base: 58.4 },
  play: async ({ canvasElement }) => {
    await expect((canvasElement.querySelector('[data-marcador]') as HTMLElement).style.left).toBe('96%');
  },
};

export const Digitando: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Digitar o peso: 58,4 kg' }));
    const campo = tela.getByRole('textbox', { name: 'Peso em quilos' });
    await expect(campo).toHaveFocus();
    await userEvent.clear(campo);
    await userEvent.type(campo, '59,25{Enter}');
    await expect(args.aoMudar).toHaveBeenLastCalledWith(59.3);
    await expect(tela.getByRole('button', { name: 'Digitar o peso: 59,3 kg' })).toBeInTheDocument();
  },
};

export const DigitandoPorCima: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Digitar o peso: 58,4 kg' }));
    await userEvent.keyboard('59{Enter}');
    await expect(args.aoMudar).toHaveBeenLastCalledWith(59);
    await expect(tela.getByRole('button', { name: 'Digitar o peso: 59,0 kg' })).toHaveFocus();
  },
};

export const EscapeDevolveOFoco: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Digitar o peso: 58,4 kg' }));
    await userEvent.keyboard('{Escape}');
    await expect(tela.getByRole('button', { name: 'Digitar o peso: 58,4 kg' })).toHaveFocus();
    await expect(args.aoMudar).not.toHaveBeenCalled();
  },
};

export const Imperial: Story = {
  args: { medidas: IMPERIAL },
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('button', { name: 'Digitar o peso: 128,7 lb' })).toBeInTheDocument();
    await userEvent.click(tela.getByRole('button', { name: 'Aumentar 0,2 libra' }));
    await expect(tela.getByRole('button', { name: 'Digitar o peso: 128,9 lb' })).toBeInTheDocument();
    await expect(args.aoMudar).toHaveBeenLastCalledWith(expect.closeTo(128.9 / 2.20462, 6));
  },
};
