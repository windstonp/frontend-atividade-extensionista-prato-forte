import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Field } from '@/components/ui/Field';
import { ApiError } from '@/lib/api/errors';
import { OnboardingStep } from './OnboardingStep';

const meta = {
  title: 'Onboarding/OnboardingStep',
  component: OnboardingStep,
  args: {
    numero: 2,
    total: 7,
    titulo: 'Agora, seus dados',
    descricao: 'Ficam só no seu perfil. Ninguém da academia vê.',
    voltarPara: '/onboarding/objetivo',
    aoContinuar: fn(),
    children: <Field id="nome" label="Como podemos te chamar" defaultValue="Camila" />,
  },
} satisfies Meta<typeof OnboardingStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pronto: Story = {
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await waitFor(() => expect(tela.getByRole('heading', { name: 'Agora, seus dados' })).toHaveFocus());
    await expect(tela.getByText('Etapa 2 de 7')).toBeVisible();
    await expect(tela.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/onboarding/objetivo');
    await userEvent.click(tela.getByRole('button', { name: 'Continuar' }));
    await expect(args.aoContinuar).toHaveBeenCalledOnce();
  },
};

export const EnterContinua: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.type(within(canvasElement).getByLabelText('Como podemos te chamar'), '{Enter}');
    await expect(args.aoContinuar).toHaveBeenCalledOnce();
  },
};

export const Carregando: Story = {
  args: { carregando: true },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByLabelText('Carregando suas respostas')).toHaveAttribute('aria-busy', 'true');
    await expect(tela.queryByLabelText('Como podemos te chamar')).toBeNull();
    await expect(tela.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  },
};

export const Salvando: Story = {
  args: { salvando: true },
  play: async ({ canvasElement, args }) => {
    const botao = within(canvasElement).getByRole('button', { name: 'Salvando…' });
    await expect(botao).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(botao, { pointerEventsCheck: 0 });
    await expect(args.aoContinuar).not.toHaveBeenCalled();
  },
};

export const ErroAoSalvar: Story = {
  args: { erroAoSalvar: new ApiError(0, 'NETWORK_ERROR', 'Não foi possível salvar. Tente de novo.') },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('Não foi possível salvar. Tente de novo.');
  },
};

export const ErroAoCarregar: Story = {
  args: { erroAoCarregar: { aoTentarDeNovo: fn() } },
  play: async ({ canvasElement, args }) => {
    const tela = within(canvasElement);
    await expect(tela.getByText('Não foi possível carregar suas respostas')).toBeVisible();
    await expect(tela.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    await userEvent.click(tela.getByRole('button', { name: 'Tentar de novo' }));
    await expect(args.erroAoCarregar?.aoTentarDeNovo).toHaveBeenCalledOnce();
  },
};

export const ModoEdicao: Story = {
  args: { rotuloBotao: 'Salvar', voltarPara: '/perfil' },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement);
    await expect(tela.getByRole('button', { name: 'Salvar' })).toBeEnabled();
    await expect(tela.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/perfil');
  },
};

export const PrimeiraEtapa: Story = {
  args: { numero: 1, voltarPara: null, titulo: 'Qual é seu objetivo agora?' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('link', { name: 'Voltar' })).toBeNull();
  },
};

export const SemEscolha: Story = {
  args: { podeContinuar: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Continuar' })).toBeDisabled();
  },
};
