import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SuggestionList } from './SuggestionList';

const meta = {
  title: 'Nutri/SuggestionList',
  component: SuggestionList,
  args: {
    sugestoes: [
      { id: 'almoco', question: 'O que como no almoço se estiver sem tempo?' },
      { id: 'pre', question: 'Posso treinar em jejum?' },
      { id: 'jantar', question: 'Jantar tarde atrapalha?' },
    ],
    aoEscolher: fn(),
  },
} satisfies Meta<typeof SuggestionList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Perguntas: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Perguntas que cabem agora' })).toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Posso treinar em jejum?' }));
    await expect(args.aoEscolher).toHaveBeenCalledWith('Posso treinar em jejum?');
  },
};

export const Carregando: Story = {
  args: { sugestoes: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0);
  },
};
