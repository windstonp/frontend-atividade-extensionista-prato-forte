import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { diaApi } from '@/mocks/fixtures/dia';
import type { Dia } from '../tipos';
import { FoodItemRow } from './FoodItemRow';

const arroz = camelizar<Dia>(diaApi()).meals[2].items[0];

const meta = {
  title: 'Dia/FoodItemRow',
  component: FoodItemRow,
  decorators: [(Story) => <ul className="list-none rounded-[20px] bg-white px-[18px]"><Story /></ul>],
  args: { item: arroz, indice: 0, ultimo: true, aoTrocar: fn() },
} satisfies Meta<typeof FoodItemRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('150 g, mais ou menos 6 colheres de sopa')).toBeInTheDocument();
    await userEvent.click(tela.getByRole('button', { name: 'Trocar Arroz branco cozido' }));
    await expect(args.aoTrocar).toHaveBeenCalled();
  },
};

export const Trocado: Story = {
  args: { item: { ...arroz, name: 'Batata-doce cozida', replacedFrom: 'Arroz branco cozido', source: 'manual' } },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('Trocado')).toBeInTheDocument();
    await expect(tela.getByText('No lugar de arroz branco cozido')).toBeInTheDocument();
  },
};

export const SemBotaoTrocar: Story = {
  args: { aoTrocar: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};
