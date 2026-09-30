import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { IMPERIAL } from '@/lib/units';
import { WeightDeltaMessage } from './WeightDeltaMessage';

const meta = {
  title: 'Evolução/WeightDeltaMessage',
  component: WeightDeltaMessage,
  args: { objetivo: 'ganhar-massa', diferencaKg: 0.2, diasDesdeUltima: 7 },
} satisfies Meta<typeof WeightDeltaMessage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GanharSubiu: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('São 200 g a mais que na última pesagem. Dentro do esperado para quem está ganhando massa.')).toBeInTheDocument();
  },
};
export const GanharDesceu: Story = { args: { diferencaKg: -0.3 } };
export const PerderSubiu: Story = { args: { objetivo: 'perder-gordura', diferencaKg: 0.4 } };
export const PerderDesceu: Story = { args: { objetivo: 'perder-gordura', diferencaKg: -0.4 } };
export const ManterPouco: Story = { args: { objetivo: 'manter-peso', diferencaKg: 0.3 } };
export const ManterMuito: Story = { args: { objetivo: 'manter-peso', diferencaKg: -0.8 } };
export const Disposicao: Story = { args: { objetivo: 'mais-disposicao', diferencaKg: 0.3 } };
export const Igual: Story = {
  args: { diferencaKg: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Mesmo peso da semana passada. Uma semana estável é normal.')).toBeInTheDocument();
  },
};

export const Imperial: Story = {
  args: { medidas: IMPERIAL },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('São 0,4 lb a mais que na última pesagem. Dentro do esperado para quem está ganhando massa.')).toBeInTheDocument();
  },
};
