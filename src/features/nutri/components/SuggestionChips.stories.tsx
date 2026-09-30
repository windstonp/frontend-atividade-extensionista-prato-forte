import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SuggestionChips } from './SuggestionChips';

const meta = {
  title: 'Nutri/SuggestionChips',
  component: SuggestionChips,
  args: { sugestoes: ['E no jantar, o que como?', 'Por que a batata segura mais a fome?', 'O que como antes do treino?'], aoEscolher: fn() },
} satisfies Meta<typeof SuggestionChips>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TresSugestoes: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getAllByRole('button')).toHaveLength(3);
    await userEvent.click(tela.getByRole('button', { name: 'E no jantar, o que como?' }));
    await expect(args.aoEscolher).toHaveBeenCalledWith('E no jantar, o que como?');
  },
};

export const UmaSugestao: Story = { args: { sugestoes: ['E depois do treino?'] } };

export const TextoLongo: Story = {
  args: { sugestoes: ['Como eu faço para fechar a proteína do dia sem exagerar no jantar?'] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button')).toHaveTextContent('Como eu faço para fechar a proteína do dia sem exagerar no jantar?');
  },
};

export const Vazia: Story = {
  args: { sugestoes: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};
