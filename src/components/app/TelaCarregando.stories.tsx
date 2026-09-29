import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { TelaCarregando } from './TelaCarregando';

const meta = { title: 'App/TelaCarregando', component: TelaCarregando } satisfies Meta<typeof TelaCarregando>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvasElement }) => {
    const estado = within(canvasElement).getByRole('status');
    await expect(estado).toHaveAttribute('aria-busy', 'true');
    await expect(estado).toHaveTextContent('Carregando…');
  },
};
