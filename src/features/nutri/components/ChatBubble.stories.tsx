import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { respostaRefeicaoApi, respostaTrocaApi } from '@/mocks/fixtures/nutri';
import type { MensagemNutri } from '../tipos';
import { PerguntaBubble, RespostaBubble } from './ChatBubble';

const meta = { title: 'Nutri/ChatBubble', component: PerguntaBubble, args: { texto: 'Posso trocar o arroz por batata?' } } satisfies Meta<typeof PerguntaBubble>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Usuario: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Posso trocar o arroz por batata?')).toBeInTheDocument();
  },
};

export const UsuarioEnviando: Story = {
  args: { status: 'enviando' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText('Não enviada')).toBeNull();
  },
};

export const UsuarioFalhou: Story = {
  args: { status: 'falhou', aoReenviar: fn() },
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('Não enviada')).toBeInTheDocument();
    await userEvent.click(tela.getByRole('button', { name: 'Tentar de novo' }));
    await expect(args.aoReenviar).toHaveBeenCalled();
  },
};

export const Assistente: Story = {
  render: () => <RespostaBubble mensagem={camelizar<MensagemNutri>(respostaTrocaApi(2, { acoes: false }))} aoAgir={fn()} />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText(/No seu almoço os 150 g de arroz/)).toBeInTheDocument();
    await expect(tela.queryByRole('button')).toBeNull();
  },
};

export const AssistenteComFollowUp: Story = {
  render: () => <RespostaBubble mensagem={camelizar<MensagemNutri>(respostaTrocaApi(2))} aoAgir={fn()} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('A batata-doce tem mais fibra e segura a fome até o treino.')).toBeInTheDocument();
  },
};

export const AssistenteComRefeicao: Story = {
  render: () => <RespostaBubble mensagem={camelizar<MensagemNutri>(respostaRefeicaoApi(3))} aoAgir={fn()} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Fica 8 g de proteína abaixo do jantar original.')).toBeInTheDocument();
  },
};

export const Confirmacao: Story = {
  render: () => (
    <RespostaBubble
      mensagem={{
        ...camelizar<MensagemNutri>(respostaTrocaApi(13, { acoes: false })),
        content: 'Feito. Seu almoço de hoje vai com batata-doce cozida.',
        followUp: null,
        card: null,
        actions: [{ index: 0, kind: 'ver-refeicao', label: 'Ver a refeição', slot: 'almoco' }],
        actionsAvailable: true,
      }}
      aoAgir={fn()}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Ver a refeição' })).toHaveAttribute('href', '/dieta/almoco');
  },
};
