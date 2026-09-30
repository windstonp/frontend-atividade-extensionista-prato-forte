import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { contextoApi } from '@/mocks/fixtures/nutri';
import type { LinhaContexto } from '../tipos';
import { ContextCard } from './ContextCard';

const meta = { title: 'Nutri/ContextCard', component: ContextCard, args: { linhas: contextoApi as LinhaContexto[] } } satisfies Meta<typeof ContextCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ComAlergia: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('O que estou olhando agora')).toBeInTheDocument();
    await expect(tela.getByText('Sua alergia a amendoim e castanhas')).toBeInTheDocument();
  },
};

export const SemProximaRefeicao: Story = {
  args: { linhas: (contextoApi as LinhaContexto[]).slice(1) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText(/Seu almoço/)).toBeNull();
  },
};

export const Carregando: Story = {
  args: { linhas: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status', { name: 'Carregando o que o Nutri está olhando' })).toBeInTheDocument();
  },
};
