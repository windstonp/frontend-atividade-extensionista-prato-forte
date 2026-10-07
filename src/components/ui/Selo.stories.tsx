import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { IconeCheck } from '@/components/icons';
import { Selo } from './Selo';

const meta = { title: 'UI/Selo', component: Selo, args: { tom: 'mata', children: 'Trocado' } } satisfies Meta<typeof Selo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Mata: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Trocado')).toHaveClass('text-mata-texto');
  },
};
export const Gema: Story = { args: { tom: 'gema', children: 'meta sugerida' } };
export const Alerta: Story = {
  args: { tom: 'alerta', children: 'Alergia' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Alergia')).toHaveClass('text-alerta');
  },
};
export const Neutro: Story = { args: { tom: 'neutro', children: 'Dia de descanso' } };
export const ComIcone: Story = { args: { children: 'Refeição feita', icone: <IconeCheck size={12} strokeWidth={2.4} /> } };
export const Pulsante: Story = {
  args: { tom: 'gema', pulsante: true, children: 'Próxima refeição' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-ponto]')).toHaveClass('animate-respira');
  },
};
export const MovimentoReduzido: Story = { args: { tom: 'gema', pulsante: true, children: 'Próxima refeição' }, globals: { movimento: 'reduzido' } };
