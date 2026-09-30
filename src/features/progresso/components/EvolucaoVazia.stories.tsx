import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { EvolucaoVazia } from './EvolucaoVazia';

const meta = { title: 'Evolução/EvolucaoVazia', component: EvolucaoVazia } satisfies Meta<typeof EvolucaoVazia>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ComBotao: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('heading', { name: 'Sua linha começa na primeira pesagem' })).toBeInTheDocument();
    await expect(tela.getByRole('link', { name: 'Registrar meu peso' })).toHaveAttribute('href', '/evolucao/peso');
  },
};
