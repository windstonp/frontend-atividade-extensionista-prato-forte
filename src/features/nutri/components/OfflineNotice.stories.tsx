import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { OfflineNotice } from './OfflineNotice';

const meta = { title: 'Nutri/OfflineNotice', component: OfflineNotice } satisfies Meta<typeof OfflineNotice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SemInternet: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toHaveTextContent('Sua pergunta não saiu daqui');
    await expect(c.getByRole('link', { name: 'Ver as refeições de hoje' })).toHaveAttribute('href', '/dieta');
  },
};
