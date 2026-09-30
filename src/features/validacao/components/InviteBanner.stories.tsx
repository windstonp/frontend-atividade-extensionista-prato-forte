import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { InviteBanner } from './InviteBanner';

const meta = { title: 'Validação/InviteBanner', component: InviteBanner, args: { aoDispensar: fn() } } satisfies Meta<typeof InviteBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Visivel: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText(/^Você já usa o Prato Forte há uma semana\./)).toBeInTheDocument();
    await expect(tela.getByRole('link', { name: 'Responder' })).toHaveAttribute('href', '/perfil/avaliar');
    await userEvent.click(tela.getByRole('button', { name: 'Agora não' }));
    await expect(args.aoDispensar).toHaveBeenCalled();
  },
};
