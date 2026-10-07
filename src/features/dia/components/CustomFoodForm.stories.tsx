import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CustomFoodForm } from './CustomFoodForm';

const m = {
  title: 'Dia/CustomFoodForm',
  component: CustomFoodForm,
  args: { inicial: { name: 'barra de cereal' }, salvando: false, erros: {}, aoSalvar: fn(), aoVoltar: fn() },
  decorators: [(Story) => <div className="bg-white p-5"><Story /></div>],
} satisfies Meta<typeof CustomFoodForm>;
export default m;
type Story = StoryObj<typeof m>;

export const Novo: Story = {
  play: async ({ canvasElement, args }) => {
    const t = within(canvasElement);
    await userEvent.type(t.getByLabelText('Calorias'), '380');
    await userEvent.type(t.getByLabelText('Proteína'), '30');
    await userEvent.type(t.getByLabelText('Carboidrato'), '35');
    await userEvent.type(t.getByLabelText('Gordura'), '12');
    await userEvent.click(t.getByRole('button', { name: 'Salvar e continuar' }));
    await expect(args.aoSalvar).toHaveBeenCalledWith({ name: 'barra de cereal', measure: 'g', per100: { calories: 380, protein: 30, carbs: 35, fat: 12 } });
  },
};

export const ComErros: Story = {
  args: { erros: { 'per100.calories': 'Os números não batem: confira as calorias.' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Os números não batem: confira as calorias.')).toBeInTheDocument();
  },
};

export const EditarComApagar: Story = {
  args: { inicial: { id: 4, name: 'Barra de cereal caseira', measure: 'g', per100: { calories: 380, protein: 30, carbs: 35, fat: 12 } }, aoApagar: fn() },
  play: async ({ canvasElement, args }) => {
    const t = within(canvasElement);
    await userEvent.click(t.getByRole('button', { name: 'Apagar alimento' }));
    await expect(t.getByText('Apagar Barra de cereal caseira? O que você já registrou com ele continua no histórico.')).toBeInTheDocument();
    await userEvent.click(t.getByRole('button', { name: 'Apagar' }));
    await expect(args.aoApagar).toHaveBeenCalled();
  },
};
