import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { respostaRefeicaoApi } from '@/mocks/fixtures/nutri';
import type { CartaoRefeicao, MensagemNutri } from '../tipos';
import { MealSuggestionCard } from './MealSuggestionCard';

const cartao = camelizar<MensagemNutri>(respostaRefeicaoApi(3)).card as CartaoRefeicao;

const meta = { title: 'Nutri/MealSuggestionCard', component: MealSuggestionCard, args: { cartao } } satisfies Meta<typeof MealSuggestionCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ComAviso: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('Jantar, 20:30')).toBeInTheDocument();
    await expect(tela.getAllByRole('listitem')).toHaveLength(3);
    await expect(tela.getByText('Fica 8 g de proteína abaixo do jantar original.')).toBeInTheDocument();
  },
};

export const SemAviso: Story = {
  args: { cartao: { ...cartao, warning: null } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText(/proteína abaixo/)).toBeNull();
  },
};
