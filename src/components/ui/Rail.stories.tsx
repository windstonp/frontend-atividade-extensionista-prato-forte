import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { Rail, RailSimples, ReguaPeso } from './Rail';

const meta = { title: 'UI/Rail', component: Rail, args: { rotulo: 'Proteína', valor: 92, meta: 120 } } satisfies Meta<typeof Rail>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Proteina: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Proteína')).toBeInTheDocument();
  },
};
export const AcimaDaMeta: Story = { args: { valor: 140 } };
export const Calorias: Story = { args: { rotulo: 'Calorias', valor: 1850, meta: 2100, unidade: 'kcal', cor: 'bg-gema' } };
export const Simples: Story = { render: () => <RailSimples rotulo="Carboidrato" valor="210 g" proporcao={0.7} cor="bg-mata" /> };
export const Regua: Story = { render: () => <ReguaPeso inicio={56.8} atual={58.4} meta={60} /> };
export const ReguaEscura: Story = { render: () => <div className="bg-tinta p-4"><ReguaPeso escuro inicio={56.8} atual={58.4} meta={60} /></div> };
export const ReguaManter: Story = { render: () => <ReguaPeso inicio={60} atual={60} meta={60} /> };
