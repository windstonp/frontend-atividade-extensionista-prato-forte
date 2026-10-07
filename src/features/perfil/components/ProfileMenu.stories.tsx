import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ProfileMenu } from './ProfileMenu';

const itens = [
  { href: '/onboarding/dados?editar=1', titulo: 'Dados pessoais', valor: '24 anos, 1,65 m, 58,4 kg' },
  { href: '/perfil/preferencias', titulo: 'Restrições e alergias', valor: 'Castanhas', alerta: true },
  { href: '/perfil/avaliar', titulo: 'Avaliar o app', valor: 'Responda umas perguntas rápidas' },
];

const meta = { title: 'Perfil/ProfileMenu', component: ProfileMenu, args: { itens } } satisfies Meta<typeof ProfileMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Seu perfil' });
    await expect(within(nav).getAllByRole('link')).toHaveLength(3);
    await expect(within(nav).getByText('Castanhas')).toHaveClass('text-alerta');
  },
};

export const JaAvaliou: Story = {
  args: { itens: [...itens.slice(0, 2), { href: '', titulo: 'Avaliar o app', valor: 'Obrigado por avaliar!', desabilitado: true }] },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Obrigado por avaliar!')).toBeInTheDocument();
    await expect(c.queryByRole('link', { name: /Avaliar o app/ })).toBeNull();
  },
};
