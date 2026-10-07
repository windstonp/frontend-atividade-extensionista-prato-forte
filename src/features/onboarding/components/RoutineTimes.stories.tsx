import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RoutineTimes } from './RoutineTimes';

const meta = {
  title: 'Onboarding/RoutineTimes',
  component: RoutineTimes,
  args: { horas: { wakeTime: '06:20', trainingTime: '19:00', sleepTime: '23:00' }, erros: {}, aoMudar: fn() },
} satisfies Meta<typeof RoutineTimes>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Acorda às')).toHaveValue('06:20');
    await userEvent.clear(c.getByLabelText('Treina às'));
    await userEvent.type(c.getByLabelText('Treina às'), '18:30');
    await expect(args.aoMudar).toHaveBeenCalledWith('trainingTime', expect.any(String));
  },
};

export const ErroTreino: Story = {
  args: { erros: { trainingTime: 'O treino precisa ser entre a hora de acordar e a de dormir.' } },
  play: async ({ canvasElement }) => {
    const treino = within(canvasElement).getByLabelText('Treina às');
    await expect(treino).toHaveAttribute('aria-invalid', 'true');
    await expect(treino).toHaveAccessibleDescription('O treino precisa ser entre a hora de acordar e a de dormir.');
  },
};
