import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';
import { CountUp } from './CountUp';
import { Reveal } from './Reveal';

const meta = { title: 'UI/Movimento', component: CountUp, args: { valor: 58.4, casas: 1 } } satisfies Meta<typeof CountUp>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Contagem: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText('58,4')).toBeInTheDocument(), { timeout: 3000 });
  },
};
export const ContagemSemMovimento: Story = {
  globals: { movimento: 'reduzido' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText('58,4')).toBeInTheDocument());
  },
};
export const Revelar: Story = {
  render: () => (
    <Reveal>
      <p className="rounded-2xl bg-white p-4">Bloco que aparece ao entrar na tela.</p>
    </Reveal>
  ),
};
