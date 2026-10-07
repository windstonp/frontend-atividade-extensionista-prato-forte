import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PlanGenerating } from './PlanGenerating';

const meta = {
  title: 'Plano/PlanGenerating',
  component: PlanGenerating,
  args: { concluidos: 2, falhou: false, tentando: false, aoTentarDeNovo: fn() },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PlanGenerating>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Montando: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Montando seu plano' })).toBeInTheDocument();
    await expect(c.getByText('Escolhendo alimentos da sua lista')).toHaveClass('font-semibold');
  },
};
export const QuaseLa: Story = { args: { concluidos: 4 } };
export const Pronto: Story = { args: { concluidos: 5 } };
export const Falhou: Story = {
  args: { falhou: true },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Não deu para montar agora' })).toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Tentar de novo' }));
    await expect(args.aoTentarDeNovo).toHaveBeenCalled();
  },
};
export const MovimentoReduzido: Story = { globals: { movimento: 'reduzido' } };
