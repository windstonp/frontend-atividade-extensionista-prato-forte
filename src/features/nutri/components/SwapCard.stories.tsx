import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { respostaTrocaApi } from '@/mocks/fixtures/nutri';
import type { CartaoTroca, MensagemNutri } from '../tipos';
import { SwapCard } from './SwapCard';

const cartao = camelizar<MensagemNutri>(respostaTrocaApi(2)).card as CartaoTroca;

const meta = { title: 'Nutri/SwapCard', component: SwapCard, args: { cartao } } satisfies Meta<typeof SwapCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReducaoDeKcal: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('group', { name: 'De arroz branco cozido para batata-doce cozida' })).toBeInTheDocument();
    await expect(tela.getByText('−15 kcal no dia')).toHaveClass('text-mata');
    await expect(tela.getByText('42,2 g para 42,3 g')).toBeInTheDocument();
  },
};

export const Aumento: Story = {
  args: { cartao: { ...cartao, calorieDelta: 20 } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('+20 kcal no dia')).toHaveClass('text-fumo');
  },
};
