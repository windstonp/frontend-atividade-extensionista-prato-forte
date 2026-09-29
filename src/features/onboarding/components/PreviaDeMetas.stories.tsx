import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { PreviaDeMetas } from './PreviaDeMetas';

const meta = {
  title: 'Onboarding/PreviaDeMetas',
  component: PreviaDeMetas,
  args: { estado: { kcal: 2250, proteinG: 115, carbsG: 305, fatG: 65, meals: 5 } },
} satisfies Meta<typeof PreviaDeMetas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pronta: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Com isso, seu plano começa em/)).toHaveTextContent(
      'Com isso, seu plano começa em 2.250 kcal por dia, com 115 g de proteína divididos em 5 refeições.',
    );
  },
};

export const PreviaCarregando: Story = {
  args: { estado: 'carregando' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Calculando suas metas')).toHaveAttribute('aria-busy', 'true');
  },
};

export const PreviaIndisponivel: Story = {
  args: { estado: 'indisponivel' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText(/Com isso/)).toBeNull();
  },
};
