import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { camelizar } from '@/lib/api/case';
import { diaApi } from '@/mocks/fixtures/dia';
import type { Dia } from '../tipos';
import { DayRail } from './DayRail';

const refeicoes = (feitas: string[] = []) => camelizar<Dia>(diaApi({ feitas })).meals;

const meta = {
  title: 'Dia/DayRail',
  component: DayRail,
  args: { refeicoes: refeicoes() },
} satisfies Meta<typeof DayRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ManhaNadaFeito: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('0 de 5 refeições')).toBeInTheDocument();
    await expect(tela.getByRole('heading', { name: 'Café da manhã' })).toBeInTheDocument();
    await expect(tela.getByText('de 378 kcal')).toBeInTheDocument();
    await expect(tela.getByRole('link', { name: 'Registrar refeição' })).toHaveAttribute('href', '/dieta/cafe');
    await expect(tela.queryByRole('button')).toBeNull(); // spec 09: não há mais "marcar como feita"
  },
};

export const MeioDoDia: Story = {
  args: { refeicoes: refeicoes(['cafe', 'lanche']) },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('2 de 5 refeições')).toBeInTheDocument();
    await expect(tela.getByRole('heading', { name: 'Almoço' })).toBeInTheDocument();
    await expect(tela.getByRole('link', { name: 'Registrar refeição' })).toHaveAttribute('href', '/dieta/almoco');
    await expect(tela.getByRole('link', { name: 'Café da manhã' })).toHaveAttribute('href', '/dieta/cafe');
  },
};

export const TudoFeito: Story = {
  args: { refeicoes: refeicoes(['cafe', 'lanche', 'almoco', 'pre-treino', 'jantar']) },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('5 de 5 refeições')).toBeInTheDocument();
    await expect(tela.queryByRole('button')).toBeNull();
  },
};

export const UmaTrocada: Story = {
  args: {
    refeicoes: refeicoes(['cafe', 'lanche']).map((m) =>
      m.slot === 'almoco' ? { ...m, summary: 'Batata-doce cozida, feijão carioca, frango grelhado e salada de alface e tomate' } : m,
    ),
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Batata-doce cozida, feijão/)).toBeInTheDocument();
  },
};
