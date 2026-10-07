import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { NutriBar } from './NutriBar';

const meta = { title: 'App/NutriBar', component: NutriBar, args: { texto: 'Pergunte ao Nutri sobre o almoço' } } satisfies Meta<typeof NutriBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: /Pergunte ao Nutri/ })).toHaveAttribute('href', '/nutri');
  },
};
export const ComContexto: Story = { args: { href: '/nutri?pergunta=Posso%20trocar%20o%20arroz%3F' } };
