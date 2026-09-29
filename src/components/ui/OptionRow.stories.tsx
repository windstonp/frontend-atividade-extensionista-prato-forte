import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EtiquetaAlergia, OptionRow } from './OptionRow';

const meta = {
  title: 'UI/OptionRow',
  component: OptionRow,
  args: { marcado: false, onClick: fn(), titulo: 'Ganhar massa magra', descricao: 'Comer um pouco acima do gasto, com proteína alta todo dia.' },
} satisfies Meta<typeof OptionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Rádio só existe dentro de um grupo (axe: aria-required-parent). */
const emGrupo: Story['decorators'] = [(Historia) => <div role="radiogroup" aria-label="Objetivo"><Historia /></div>];

export const Desmarcado: Story = {
  decorators: emGrupo,
  play: async ({ canvasElement, args }) => {
    const opcao = within(canvasElement).getByRole('radio', { name: /Ganhar massa magra/ });
    await expect(opcao).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(opcao);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Marcado: Story = {
  args: { marcado: true },
  decorators: emGrupo,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radio')).toHaveAttribute('aria-checked', 'true');
  },
};

export const Quadrado: Story = {
  args: { quadrado: true, compacto: true, titulo: 'Glúten', descricao: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox', { name: 'Glúten' })).toBeInTheDocument();
  },
};

export const ComAlergia: Story = {
  args: { quadrado: true, compacto: true, marcado: true, titulo: 'Amendoim e castanhas', descricao: undefined, etiqueta: <EtiquetaAlergia /> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox', { name: /Amendoim e castanhas/ })).toHaveTextContent('Alergia');
  },
};
