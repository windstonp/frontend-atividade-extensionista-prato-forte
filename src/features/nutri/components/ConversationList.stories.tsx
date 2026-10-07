import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { conversaApi } from '@/mocks/fixtures/nutri';
import type { Conversa } from '../tipos';
import { ConversationList } from './ConversationList';

const conversas = [12, 11, 10].map((id) => camelizar<Conversa>(conversaApi(id)));

const meta = {
  title: 'Nutri/ConversationList',
  component: ConversationList,
  args: { conversas, apagandoId: null, aoApagar: fn(), temMais: false, aoCarregarMais: fn() },
} satisfies Meta<typeof ConversationList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Recentes: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Recentes' })).toBeInTheDocument();
    await expect(c.getAllByRole('listitem')).toHaveLength(3);
    await userEvent.click(c.getAllByRole('button', { name: /Apagar/ })[0]);
    await expect(args.aoApagar).toHaveBeenCalledWith(12);
  },
};

export const ComMaisAntigas: Story = {
  args: { temMais: true },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Ver conversas mais antigas' }));
    await expect(args.aoCarregarMais).toHaveBeenCalled();
  },
};

export const ComPergunta: Story = { args: { pergunta: 'Posso trocar o arroz por batata?' } };
