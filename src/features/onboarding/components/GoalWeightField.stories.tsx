import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { AVISO_META_FORA, MENSAGENS } from '../regras';
import { GoalWeightField } from './GoalWeightField';

const meta = {
  title: 'Onboarding/GoalWeightField',
  component: GoalWeightField,
  args: { objetivo: 'ganhar-massa', alturaCm: 164, valor: '', onChange: fn() },
} satisfies Meta<typeof GoalWeightField>;

export default meta;
type Story = StoryObj<typeof meta>;

const campo = (canvas: HTMLElement) => within(canvas).queryByLabelText('Meta de peso (opcional)');

export const Oculto: Story = {
  args: { objetivo: 'mais-disposicao' },
  play: async ({ canvasElement }) => {
    await expect(campo(canvasElement)).toBeNull();
  },
};

export const VazioComFaixa: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Para 1,64 m, a faixa saudável vai de 49,8 a 67,0 kg.')).toBeVisible();
    await expect(campo(canvasElement)).toHaveValue('');
  },
};

export const SemAltura: Story = {
  args: { alturaCm: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Opcional. Se deixar vazio, sugerimos uma meta saudável para você.')).toBeVisible();
  },
};

export const DentroDaFaixa: Story = {
  args: { valor: '62' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText(AVISO_META_FORA)).toBeNull();
  },
};

export const ForaDaFaixaComAviso: Story = {
  args: { valor: '75' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(AVISO_META_FORA)).toBeInTheDocument();
    await expect(campo(canvasElement)).not.toHaveAttribute('aria-invalid');
  },
};

export const DirecaoErrada: Story = {
  args: { valor: '55', erro: MENSAGENS.metaGanhar },
  play: async ({ canvasElement }) => {
    await expect(campo(canvasElement)).toHaveAttribute('aria-invalid', 'true');
    await expect(within(canvasElement).getByText(MENSAGENS.metaGanhar)).toBeInTheDocument();
  },
};
