import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { registroDaSugestao, refeicaoApi } from '@/mocks/fixtures/dia';
import type { Registro } from '../tipos';
import { EntryList } from './EntryList';

const registros = camelizar<Registro[]>(refeicaoApi('almoco', 2, false, false).items.slice(0, 2).map((i) => registroDaSugestao(i)));

const m = {
  title: 'Dia/EntryList',
  component: EntryList,
  args: { registros, aoAbrir: fn(), aoAdicionar: fn() },
  decorators: [(Story) => <div className="bg-papel p-5"><Story /></div>],
} satisfies Meta<typeof EntryList>;
export default m;
type Story = StoryObj<typeof m>;

export const ComItens: Story = {
  play: async ({ canvasElement, args }) => {
    const t = within(canvasElement);
    await userEvent.click(t.getByRole('button', { name: /Arroz branco cozido, 150 g/ }));
    await expect(args.aoAbrir).toHaveBeenCalledWith(registros[0]);
    await userEvent.click(t.getByRole('button', { name: 'Adicionar alimento' }));
    await expect(args.aoAdicionar).toHaveBeenCalled();
  },
};
export const Vazia: Story = {
  args: { registros: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Nada registrado ainda. Toque em + numa sugestão ou adicione o que você comeu.')).toBeInTheDocument();
  },
};
export const SomenteLeitura: Story = {
  args: { aoAbrir: undefined, aoAdicionar: undefined },
  play: async ({ canvasElement }) => {
    const t = within(canvasElement);
    await expect(t.queryByRole('button', { name: 'Adicionar alimento' })).toBeNull();
    await expect(t.getByText('Arroz branco cozido')).toBeInTheDocument();
  },
};
