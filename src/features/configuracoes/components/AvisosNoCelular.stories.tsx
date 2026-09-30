import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AvisosNoCelular } from './AvisosNoCelular';

const meta = {
  title: 'Configurações/AvisosNoCelular',
  component: AvisosNoCelular,
  args: { avisos: { mealReminders: true, weeklySummary: true, tips: false }, estado: 'ok', salvando: false, aoMudar: fn() },
} satisfies Meta<typeof AvisosNoCelular>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PermissaoPadrao: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getAllByRole('switch')).toHaveLength(3);
    await userEvent.click(tela.getByRole('switch', { name: 'Dicas do Nutri' }));
    await expect(args.aoMudar).toHaveBeenCalledWith('tips', true);
  },
};

export const PermissaoNegada: Story = {
  args: { estado: 'negada', avisos: { mealReminders: false, weeklySummary: false, tips: false } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Os avisos estão bloqueados no navegador. Libere nas configurações do celular para ligar.')).toBeInTheDocument();
  },
};

export const SemSuporte: Story = {
  args: { estado: 'sem-suporte' },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('Este navegador não recebe avisos. Tente no Chrome do celular.')).toBeInTheDocument();
    for (const chave of tela.getAllByRole('switch')) await expect(chave).toBeDisabled();
  },
};

export const IosSemPwa: Story = {
  args: { estado: 'ios-sem-pwa' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No iPhone, os avisos só funcionam com o Prato Forte na tela de início: toque em Compartilhar → Adicionar à Tela de Início.')).toBeInTheDocument();
  },
};

export const Salvando: Story = {
  args: { salvando: true },
  play: async ({ canvasElement }) => {
    for (const chave of within(canvasElement).getAllByRole('switch')) await expect(chave).toBeDisabled();
  },
};
