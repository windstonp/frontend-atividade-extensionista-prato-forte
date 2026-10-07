import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { alimentosApi, leiteComLactose, recentesApi } from '@/mocks/fixtures/alimentos';
import type { AlimentoBusca } from '../tipos';
import { FoodSearchStep } from './FoodSearchStep';

const resultados = camelizar<AlimentoBusca[]>([leiteComLactose, ...alimentosApi.slice(1)]);

const m = {
  title: 'Dia/FoodSearchStep',
  component: FoodSearchStep,
  args: {
    termo: '', aoMudarTermo: fn(), resultados: undefined, recentes: camelizar<AlimentoBusca[]>(recentesApi), carregando: false,
    aoEscolher: fn(), aoEditarProprio: fn(), aoCadastrar: fn(), nutriHref: '/nutri',
  },
  decorators: [(Story) => <div className="bg-white p-5"><Story /></div>],
} satisfies Meta<typeof FoodSearchStep>;
export default m;
type Story = StoryObj<typeof m>;

export const Recentes: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Você costuma comer')).toBeInTheDocument();
  },
};

export const Resultados: Story = {
  args: { termo: 'le', resultados },
  play: async ({ canvasElement, args }) => {
    const t = within(canvasElement);
    await expect(t.getByText('Intolerância a lactose')).toBeInTheDocument();
    await expect(t.getByText('Seu')).toBeInTheDocument();
    await userEvent.click(t.getByRole('button', { name: 'Editar Barra de cereal caseira' }));
    await expect(args.aoEditarProprio).toHaveBeenCalledWith(resultados[2]);
  },
};

export const SemResultado: Story = {
  args: { termo: 'cuscuz paulista', resultados: [] },
  play: async ({ canvasElement, args }) => {
    const t = within(canvasElement);
    await expect(t.getByText('Não achamos "cuscuz paulista".')).toBeInTheDocument();
    await userEvent.click(t.getByRole('button', { name: 'Cadastrar alimento' }));
    await expect(args.aoCadastrar).toHaveBeenCalled();
  },
};

export const Teclado: Story = {
  args: { termo: 'le', resultados },
  play: async ({ canvasElement }) => {
    const opcoes = within(canvasElement).getAllByRole('button').filter((b) => b.hasAttribute('data-opcao'));
    opcoes[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(opcoes[1]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(opcoes[0]).toHaveFocus();
  },
};
