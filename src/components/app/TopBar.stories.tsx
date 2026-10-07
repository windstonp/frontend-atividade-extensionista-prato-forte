import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { Selo } from '@/components/ui/Selo';
import { TopBar } from './TopBar';

const meta = { title: 'App/TopBar', component: TopBar, args: { voltarPara: '/dieta', rotuloVoltar: 'Voltar para a dieta' } } satisfies Meta<typeof TopBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Simples: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Voltar para a dieta' })).toHaveAttribute('href', '/dieta');
  },
};
export const ComSelo: Story = { args: { direita: <Selo tom="gema" pulsante>Próxima refeição</Selo> } };
export const ComNutri: Story = { args: { voltarPara: '/hoje', rotuloVoltar: 'Voltar', direita: <span className="text-sm font-semibold">Nutri</span> } };
