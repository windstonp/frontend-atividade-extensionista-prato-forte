import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AmountStep } from './AmountStep';

const m = {
  title: 'Dia/AmountStep',
  component: AmountStep,
  args: {
    nome: 'Leite integral', medida: 'ml', per100: { calories: 61, protein: 2.9, carbs: 4.3, fat: 3.2 },
    atalhos: [{ rotulo: '1 copo · 200 ml', amount: 200 }, { rotulo: '½ porção · 100 ml', amount: 100 }],
    conflitos: [], modo: 'adicionar', salvando: false, aoConfirmar: fn(), aoVoltar: fn(),
  },
  decorators: [(Story) => <div className="bg-white p-5"><Story /></div>],
} satisfies Meta<typeof AmountStep>;
export default m;
type Story = StoryObj<typeof m>;

export const Adicionar: Story = {
  play: async ({ canvasElement, args }) => {
    const t = within(canvasElement);
    await expect(t.getByRole('button', { name: 'Adicionar' })).toBeDisabled();
    await userEvent.click(t.getByRole('button', { name: '1 copo · 200 ml' }));
    await expect(t.getByText('122 kcal')).toBeInTheDocument();
    await userEvent.click(t.getByRole('button', { name: 'Adicionar' }));
    await expect(args.aoConfirmar).toHaveBeenCalledWith(200);
  },
};

export const AvisoRestricao: Story = {
  args: { conflitos: ['Intolerância a lactose'] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Este alimento tem intolerância a lactose, que está nas suas restrições.')).toBeInTheDocument();
  },
};

export const Invalido: Story = {
  play: async ({ canvasElement }) => {
    const t = within(canvasElement);
    await userEvent.type(t.getByRole('textbox', { name: 'Quantidade' }), '0');
    await expect(t.getByText('Use um número entre 0,1 e 2000, com até uma casa.')).toBeInTheDocument();
    await expect(t.getByRole('button', { name: 'Adicionar' })).toBeDisabled();
  },
};

export const Edicao: Story = {
  args: { modo: 'editar', inicial: 150, atalhos: [], aoRemover: fn(), aoVoltar: undefined },
  play: async ({ canvasElement, args }) => {
    const t = within(canvasElement);
    await expect(t.getByRole('textbox', { name: 'Quantidade' })).toHaveValue('150');
    await userEvent.click(t.getByRole('button', { name: 'Remover' }));
    await expect(args.aoRemover).toHaveBeenCalled();
  },
};
