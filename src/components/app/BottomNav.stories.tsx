import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { BottomNav } from './BottomNav';

const meta = { title: 'App/BottomNav', component: BottomNav, parameters: { nextjs: { appDirectory: true, navigation: { pathname: '/hoje' } } } } satisfies Meta<typeof BottomNav>;
export default meta;
type Story = StoryObj<typeof meta>;

const abaAtiva = (rotulo: string): Story => ({
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: { Hoje: '/hoje', Dieta: '/dieta/refeicao/3', 'Evolução': '/evolucao', Perfil: '/perfil' }[rotulo] } } },
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Navegação principal' });
    await expect(within(nav).getByRole('link', { name: rotulo })).toHaveAttribute('aria-current', 'page');
    await expect(within(nav).getAllByRole('link').filter((l) => l.getAttribute('aria-current') === 'page')).toHaveLength(1);
  },
});

export const Hoje = abaAtiva('Hoje');
export const DietaEmSubpagina = abaAtiva('Dieta');
export const Evolucao = abaAtiva('Evolução');
export const Perfil = abaAtiva('Perfil');
