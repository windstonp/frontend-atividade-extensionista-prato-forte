import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { refeicaoApi } from '@/mocks/fixtures/dia';
import type { ItemDoDia } from '../tipos';
import { SuggestionList } from './SuggestionList';

const itens = camelizar<ItemDoDia[]>(refeicaoApi('almoco', 2, false, false).items);

const m = {
  title: 'Dia/SuggestionList',
  component: SuggestionList,
  args: { itens, aoRegistrar: fn(), aoRegistrarTodos: fn(), aoTrocar: fn() },
  decorators: [(Story) => <div className="bg-papel p-5"><Story /></div>],
} satisfies Meta<typeof SuggestionList>;
export default m;
type Story = StoryObj<typeof m>;

export const NenhumRegistrado: Story = {
  play: async ({ canvasElement, args }) => {
    const t = within(canvasElement);
    await userEvent.click(t.getByRole('button', { name: 'Registrar Arroz branco cozido, 150 g, mais ou menos 6 colheres de sopa' }));
    await expect(args.aoRegistrar).toHaveBeenCalledWith(itens[0]);
    await userEvent.click(t.getByRole('button', { name: 'Adicionar os 4' }));
    await expect(args.aoRegistrarTodos).toHaveBeenCalledWith(itens);
  },
};
export const UmRegistrado: Story = {
  args: { itens: [{ ...itens[0], registered: true }, ...itens.slice(1)] },
  play: async ({ canvasElement }) => {
    const t = within(canvasElement);
    await expect(t.getByRole('button', { name: 'Arroz branco cozido já registrado' })).toBeDisabled();
    await expect(t.queryByRole('button', { name: 'Trocar Arroz branco cozido' })).toBeNull();
    await expect(t.getByRole('button', { name: 'Adicionar os 3' })).toBeInTheDocument();
  },
};
export const FaltaUm: Story = {
  args: { itens: itens.map((i, n) => ({ ...i, registered: n > 0 })) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /^Adicionar os/ })).toBeNull();
  },
};
export const Ontem: Story = {
  args: { aoTrocar: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /^Trocar/ })).toBeNull();
  },
};
export const SomenteLeitura: Story = {
  args: { aoRegistrar: undefined, aoRegistrarTodos: undefined, aoTrocar: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /^Registrar/ })).toBeNull();
  },
};
