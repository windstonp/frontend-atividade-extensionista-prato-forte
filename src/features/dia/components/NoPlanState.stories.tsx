import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NoPlanState } from './NoPlanState';

const meta = {
  title: 'Dia/NoPlanState',
  component: NoPlanState,
  args: { estado: 'gerando', planId: 43, aoTentarDeNovo: fn() },
} satisfies Meta<typeof NoPlanState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gerando: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('heading', { name: 'Seu plano está quase pronto' })).toBeInTheDocument();
    await expect(tela.getByRole('link', { name: 'Acompanhar' })).toHaveAttribute('href', '/onboarding/gerando?plano=43&voltar=%2Fhoje');
  },
};

export const Falhou: Story = {
  args: { estado: 'falhou' },
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('heading', { name: 'Não conseguimos montar seu plano' })).toBeInTheDocument();
    await userEvent.click(tela.getByRole('button', { name: 'Tentar de novo' }));
    await expect(args.aoTentarDeNovo).toHaveBeenCalled();
  },
};
