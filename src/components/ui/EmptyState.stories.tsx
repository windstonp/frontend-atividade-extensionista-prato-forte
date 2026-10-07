import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EmptyState } from './EmptyState';

const meta = { title: 'UI/EmptyState', component: EmptyState, args: { titulo: 'Nada registrado neste dia' } } satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DiaSemRegistro: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: 'Nada registrado neste dia' })).toBeInTheDocument();
  },
};
export const Evolucao: Story = {
  args: {
    titulo: 'Sua linha começa na primeira pesagem',
    descricao: 'Registre o peso hoje e repita uma vez por semana.',
    acao: { rotulo: 'Registrar meu peso', href: '/evolucao/peso' },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Registrar meu peso' })).toHaveAttribute('href', '/evolucao/peso');
  },
};
export const TrocasVazias: Story = {
  args: { titulo: 'Sem trocas para este alimento', descricao: 'Pergunte ao Nutri: ele monta uma opção com o que você tem.', acao: { rotulo: 'Perguntar ao Nutri', onClick: fn() } },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Perguntar ao Nutri' }));
    await expect((args.acao as { onClick: () => void }).onClick).toHaveBeenCalled();
  },
};
export const MediasVazias: Story = { args: { titulo: 'Marque suas refeições para ver suas médias aqui.' } };
export const Obrigado: Story = { args: { titulo: 'Obrigado por avaliar!', descricao: 'Suas respostas ajudam a ajustar o Prato Forte.', acao: { rotulo: 'Voltar para o app', href: '/hoje' } } };
export const Escuro: Story = { args: { tom: 'escuro', titulo: 'Sem plano ativo' } };
