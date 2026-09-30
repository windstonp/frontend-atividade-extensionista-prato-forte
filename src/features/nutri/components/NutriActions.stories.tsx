import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { respostaRefeicaoApi, respostaTrocaApi } from '@/mocks/fixtures/nutri';
import type { MensagemNutri } from '../tipos';
import { NutriActions } from './NutriActions';

const troca = camelizar<MensagemNutri>(respostaTrocaApi(2)).actions;
const refeicao = camelizar<MensagemNutri>(respostaRefeicaoApi(3)).actions;

const meta = { title: 'Nutri/NutriActions', component: NutriActions, args: { acoes: troca, aplicando: false, aoAgir: fn() } } satisfies Meta<typeof NutriActions>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SubstituirOutraDispensar: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Substituir no almoço de hoje' }));
    await expect(args.aoAgir).toHaveBeenCalledWith(troca[0]);
    await expect(tela.getByRole('button', { name: 'Ver outras opções' })).toBeInTheDocument();
    await expect(tela.getByRole('button', { name: 'Agora não' })).toBeInTheDocument();
  },
};

export const Aplicar: Story = {
  args: { acoes: refeicao },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Aplicar no jantar de hoje' })).toBeInTheDocument();
  },
};

export const VerRefeicao: Story = {
  args: { acoes: [{ index: 0, kind: 'ver-refeicao', label: 'Ver a refeição', slot: 'almoco' }] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Ver a refeição' })).toHaveAttribute('href', '/dieta/almoco');
  },
};

export const Aplicando: Story = {
  args: { aplicando: true },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('button', { name: /Substituir no almoço de hoje/ })).toHaveAttribute('aria-busy', 'true');
    await expect(tela.getByRole('button', { name: 'Agora não' })).toBeDisabled();
  },
};

export const Indisponivel: Story = {
  args: { acoes: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};
