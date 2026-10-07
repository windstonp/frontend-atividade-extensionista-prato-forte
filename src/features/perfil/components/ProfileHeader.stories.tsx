import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ProfileHeader } from './ProfileHeader';

const meta = { title: 'Perfil/ProfileHeader', component: ProfileHeader, args: { nome: 'Camila Rocha', desde: 'setembro de 2026' } } satisfies Meta<typeof ProfileHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Camila Rocha' })).toBeInTheDocument();
    await expect(c.getByText('CR')).toBeInTheDocument();
    await expect(c.getByText('No Prato Forte desde setembro de 2026')).toBeInTheDocument();
    await expect(c.getByRole('link', { name: 'Abrir configurações' })).toHaveAttribute('href', '/perfil/configuracoes');
  },
};
export const NomeLongo: Story = { args: { nome: 'Maria Eduarda dos Santos Albuquerque' } };
