import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { diaApi } from '@/mocks/fixtures/dia';
import type { Dia } from '../tipos';
import { MealRow } from './MealRow';

const dia = (feitas: string[] = []) => camelizar<Dia>(diaApi({ feitas })).meals;

const meta = {
  title: 'Dia/MealRow',
  component: MealRow,
  decorators: [(Story) => <ol className="list-none pl-6"><Story /></ol>],
  args: { refeicao: dia()[0], indice: 0, clicavel: true, href: '/dieta/cafe', mostrarRegistro: false },
} satisfies Meta<typeof MealRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Proxima: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('Próxima refeição')).toBeInTheDocument();
    await expect(tela.getByRole('link')).toHaveAttribute('href', '/dieta/cafe');
  },
};

export const Feita: Story = {
  args: { refeicao: dia(['cafe'])[0] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Feita')).toBeInTheDocument();
  },
};

export const ComNota: Story = {
  args: { refeicao: dia()[4], indice: 4 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Depois do treino das 19h')).toBeInTheDocument();
  },
};

export const NaoClicavel: Story = {
  args: { refeicao: { ...dia()[0], isNext: false }, clicavel: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('link')).toBeNull();
  },
};

export const DiaSemTreino: Story = {
  args: { refeicao: { ...dia()[3], name: 'Lanche da tarde', isNext: false }, indice: 3, clicavel: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Lanche da tarde')).toBeInTheDocument();
  },
};

export const ComRegistro: Story = {
  args: { refeicao: dia(['cafe'])[0], mostrarRegistro: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('378 de 378 kcal')).toBeInTheDocument();
  },
};

export const Ontem: Story = {
  args: { refeicao: dia()[4], indice: 4, href: '/dieta/jantar?data=2026-09-27', mostrarRegistro: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link')).toHaveAttribute('href', '/dieta/jantar?data=2026-09-27');
    await expect(within(canvasElement).getByText('0 de 419 kcal')).toBeInTheDocument();
  },
};
