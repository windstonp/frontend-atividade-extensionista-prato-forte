import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { conversaApi } from '@/mocks/fixtures/nutri';
import type { Conversa } from '../tipos';
import { ConversationListItem } from './ConversationListItem';

const conversa = camelizar<Conversa>(conversaApi(12));

const meta = {
  title: 'Nutri/ConversationListItem',
  component: ConversationListItem,
  decorators: [(Story) => <ul className="list-none"><Story /></ul>],
  args: { conversa, aoApagar: fn(), agora: new Date('2026-10-01T15:00:00-03:00') },
} satisfies Meta<typeof ConversationListItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('link', { name: /Posso trocar o arroz por batata\?/ })).toHaveAttribute('href', '/nutri/12');
    await expect(tela.getByText('ontem, 6 mensagens')).toBeInTheDocument();
    await userEvent.click(tela.getByRole('button', { name: 'Apagar' }));
    await expect(args.aoApagar).toHaveBeenCalled();
  },
};

export const ComPergunta: Story = {
  args: { pergunta: 'Não tenho frango em casa' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link')).toHaveAttribute('href', `/nutri/12?pergunta=${encodeURIComponent('Não tenho frango em casa')}`);
  },
};

export const TituloLongo: Story = {
  args: { conversa: { ...conversa, title: 'Posso trocar o arroz branco do almoço por batata-doce cozida…' } },
};

export const SemTitulo: Story = {
  args: { conversa: { ...conversa, title: null, preview: null } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Conversa sem título')).toBeInTheDocument();
  },
};

export const Apagando: Story = {
  args: { apagando: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Apagar' })).toBeDisabled();
  },
};
