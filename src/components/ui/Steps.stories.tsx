import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Steps } from './Steps';

const meta = { title: 'UI/Steps', component: Steps, args: { atual: 3, total: 7 } } satisfies Meta<typeof Steps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Meio: Story = {};
export const Primeira: Story = { args: { atual: 1 } };
export const Ultima: Story = { args: { atual: 7 } };
export const Questionario: Story = { args: { atual: 11, total: 13 } };
