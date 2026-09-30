import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { diaApi, substituicoesApi } from '@/mocks/fixtures/dia';
import type { Dia, Substituicoes } from '../tipos';
import { SubstitutionSheet } from './SubstitutionSheet';

const arroz = camelizar<Dia>(diaApi()).meals[2].items[0];
const opcoes = camelizar<Substituicoes>(substituicoesApi);

const meta = {
  title: 'Dia/SubstitutionSheet',
  component: SubstitutionSheet,
  args: {
    item: arroz,
    substituicoes: opcoes,
    carregando: false,
    erro: false,
    trocando: false,
    aoTentarDeNovo: fn(),
    aoTrocar: fn(),
    aoFechar: fn(),
  },
} satisfies Meta<typeof SubstitutionSheet>;

export default meta;
type Story = StoryObj<typeof meta>;
const folha = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body);

export const ComOpcoes: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = folha(canvasElement);
    await expect(await tela.findByRole('dialog', { name: 'Trocar arroz branco cozido' })).toBeInTheDocument();
    const primeira = tela.getByRole('radio', { name: /Batata-doce cozida/ });
    await expect(primeira).toHaveAttribute('aria-checked', 'true');
    await expect(tela.getByText('−15 kcal')).toBeInTheDocument();
    await expect(tela.getByText('+13 kcal')).toBeInTheDocument();

    primeira.focus();
    await userEvent.keyboard('{ArrowDown}');
    const tapioca = tela.getByRole('radio', { name: /Tapioca/ });
    await expect(tapioca).toHaveAttribute('aria-checked', 'true');
    await expect(tapioca).toHaveFocus();

    await userEvent.click(tela.getByRole('button', { name: 'Usar tapioca' }));
    await expect(args.aoTrocar).toHaveBeenCalledWith(33);
  },
};

export const GarantiaComTodasAsRestricoes: Story = {
  args: { substituicoes: { ...opcoes, guarantee: { restrictions: ['Intolerância a lactose', 'Glúten', 'camarão'] } } },
  play: async ({ canvasElement }) => {
    await expect(
      await folha(canvasElement).findByText('Nenhuma dessas opções tem intolerância a lactose, glúten e camarão.'),
    ).toBeInTheDocument();
  },
};

export const Carregando: Story = {
  args: { substituicoes: undefined, carregando: true },
  play: async ({ canvasElement }) => {
    await expect(await folha(canvasElement).findByLabelText('Buscando opções')).toBeInTheDocument();
  },
};

export const Vazia: Story = {
  args: { substituicoes: { ...opcoes, options: [] } },
  play: async ({ canvasElement }) => {
    const tela = folha(canvasElement);
    await expect(await tela.findByText(/Ainda não temos trocas cadastradas para este alimento/)).toBeInTheDocument();
    await expect(tela.getByRole('link', { name: 'Perguntar ao Nutri' })).toHaveAttribute(
      'href',
      `/nutri?pergunta=${encodeURIComponent('Não tenho arroz branco cozido em casa. O que uso no lugar?')}`,
    );
  },
};

export const Erro: Story = {
  args: { substituicoes: undefined, erro: true },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(await folha(canvasElement).findByRole('button', { name: 'Tentar de novo' }));
    await expect(args.aoTentarDeNovo).toHaveBeenCalled();
  },
};

export const Trocando: Story = {
  args: { trocando: true },
  play: async ({ canvasElement }) => {
    await expect(await folha(canvasElement).findByRole('button', { name: /Usar batata-doce cozida/ })).toHaveAttribute('aria-busy', 'true');
  },
};

export const EscFecha: Story = {
  play: async ({ canvasElement, args }) => {
    await folha(canvasElement).findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await expect(args.aoFechar).toHaveBeenCalled();
  },
};
