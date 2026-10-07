import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { Avaliacao } from '../tipos';
import { RatingButtons } from './RatingButtons';

const meta = {
  title: 'Validação/RatingButtons',
  component: RatingButtons,
  args: { variante: 'resposta', valor: null, aoMarcar: fn(), aoComentar: fn() },
  render: function Controlado(args) {
    const [valor, setValor] = useState<Avaliacao | null>(args.valor);
    return (
      <RatingButtons
        {...args}
        valor={valor}
        aoMarcar={(v) => {
          setValor(valor?.value === v ? null : { value: v, comment: null });
          args.aoMarcar(v);
        }}
      />
    );
  },
} satisfies Meta<typeof RatingButtons>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Neutro: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('button', { name: 'Resposta útil' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(tela.getByRole('button', { name: 'Resposta útil' }));
    await expect(args.aoMarcar).toHaveBeenCalledWith('up');
    await expect(tela.getByRole('button', { name: 'Resposta útil' })).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Positivo: Story = { args: { valor: { value: 'up', comment: null } } };

export const NegativoComComentario: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Resposta não ajudou' }));
    await userEvent.type(tela.getByLabelText('O que não ajudou?'), 'Não tenho batata-doce em casa.');
    await userEvent.click(tela.getByRole('button', { name: 'Enviar' }));
    await expect(args.aoComentar).toHaveBeenCalledWith('Não tenho batata-doce em casa.');
    await expect(tela.queryByLabelText('O que não ajudou?')).toBeNull();
  },
};

export const Pular: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await userEvent.click(tela.getByRole('button', { name: 'Resposta não ajudou' }));
    await userEvent.click(tela.getByRole('button', { name: 'Pular' }));
    await expect(args.aoComentar).not.toHaveBeenCalled();
    await expect(tela.queryByLabelText('O que não ajudou?')).toBeNull();
  },
};

export const PularLimpaOCampo: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Resposta não ajudou' }));
    await userEvent.type(c.getByLabelText('O que não ajudou?'), 'rascunho');
    await userEvent.click(c.getByRole('button', { name: 'Pular' }));
    await userEvent.click(c.getByRole('button', { name: 'Resposta útil' }));
    await userEvent.click(c.getByRole('button', { name: 'Resposta não ajudou' }));
    await expect(c.getByLabelText('O que não ajudou?')).toHaveValue('');
  },
};

export const Plano: Story = {
  args: { variante: 'plano' },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('button', { name: 'O plano faz sentido' })).toBeInTheDocument();
    await expect(tela.getByRole('button', { name: 'O plano não faz sentido' })).toBeInTheDocument();
  },
};

export const Teclado: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(args.aoMarcar).toHaveBeenCalledWith('up');
    await expect(within(canvasElement).getByRole('button', { name: 'Resposta útil' })).toHaveFocus();
  },
};
