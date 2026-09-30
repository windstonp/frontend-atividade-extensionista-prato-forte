import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ChatComposer } from './ChatComposer';

const meta = {
  title: 'Nutri/ChatComposer',
  component: ChatComposer,
  args: { valor: '', aoMudar: fn(), aoEnviar: fn(), enviando: false },
  render: function Controlado(args) {
    const [valor, setValor] = useState(args.valor);
    return <ChatComposer {...args} valor={valor} aoMudar={(v) => { setValor(v); args.aoMudar(v); }} />;
  },
} satisfies Meta<typeof ChatComposer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
  },
};

export const Digitando: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.type(tela.getByLabelText('Escreva sua pergunta para o Nutri'), 'Posso trocar o arroz?');
    await userEvent.click(tela.getByRole('button', { name: 'Enviar pergunta' }));
    await expect(args.aoEnviar).toHaveBeenCalled();
  },
};

export const Enviando: Story = {
  args: { valor: 'Posso trocar o arroz?', enviando: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Enviar pergunta' })).toBeDisabled();
  },
};

export const LimiteDeCaracteres: Story = {
  args: { valor: 'a'.repeat(950) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('950/1.000')).toBeInTheDocument();
  },
};
