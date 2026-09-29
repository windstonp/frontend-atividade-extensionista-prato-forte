import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { respostasDaCamila } from '@/mocks/fixtures/onboarding';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { gravandoEtapa, respondendoOnboarding } from '@/mocks/handlers/onboarding';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { EtapaDados } from './EtapaDados';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/onboarding/dados');
});

async function preencher(peso = '58,4', meta = '62') {
  const usuario = userEvent.setup();
  await usuario.type(await screen.findByLabelText('Idade'), '27');
  await usuario.type(screen.getByLabelText('Altura'), '164');
  await usuario.type(screen.getByLabelText('Peso de hoje'), peso);
  await usuario.click(screen.getByRole('radio', { name: 'Feminino' }));
  if (meta) await usuario.type(screen.getByLabelText('Meta de peso (opcional)'), meta);
  return usuario;
}

describe('Etapa Dados (S03)', () => {
  it('abre com o que foi salvo (CA01)', async () => {
    server.use(respondendoOnboarding({ answers: respostasDaCamila }));

    renderizar(<EtapaDados />);

    expect(await screen.findByLabelText('Como podemos te chamar')).toHaveValue('Camila');
    expect(screen.getByLabelText('Idade')).toHaveValue('27');
    expect(screen.getByLabelText('Altura')).toHaveValue('164');
    expect(screen.getByLabelText('Peso de hoje')).toHaveValue('58,4');
    expect(screen.getByRole('radio', { name: 'Feminino' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Meta de peso (opcional)')).toHaveValue('62');
  });

  it('salva com vírgula virando número e segue para Atividade', async () => {
    const { handler, corpos } = gravandoEtapa('dados');
    server.use(handler, respondendoOnboarding({ answers: { goal: 'ganhar-massa' } }));

    renderizar(<EtapaDados />);
    const usuario = await preencher();
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/onboarding/atividade'));
    expect(corpos).toEqual([
      { preferred_name: 'Camila', age: 27, height_cm: 164, weight_kg: 58.4, sex: 'feminino', goal_weight_kg: 62 },
    ]);
  });

  it('mostra a faixa saudável e avisa a meta fora dela sem bloquear (CA03)', async () => {
    const { handler, corpos } = gravandoEtapa('dados');
    server.use(handler, respondendoOnboarding({ answers: { goal: 'ganhar-massa' } }));

    renderizar(<EtapaDados />);
    const usuario = await preencher('58,4', '75');

    expect(screen.getByText('Para 1,64 m, a faixa saudável vai de 49,8 a 67,0 kg.')).toBeInTheDocument();
    expect(screen.getByText(/Essa meta fica fora da faixa saudável/)).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));
    await waitFor(() => expect(corpos).toHaveLength(1));
  });

  it('recusa meta abaixo do peso ao ganhar massa, sem enviar (CA02)', async () => {
    const { handler, corpos } = gravandoEtapa('dados');
    server.use(handler, respondendoOnboarding({ answers: { goal: 'ganhar-massa' } }));

    renderizar(<EtapaDados />);
    const usuario = await preencher('58,4', '55');
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('Para ganhar massa, a meta precisa ser maior que o peso de hoje.')).toBeInTheDocument();
    expect(screen.getByLabelText('Meta de peso (opcional)')).toHaveAttribute('aria-invalid', 'true');
    expect(corpos).toEqual([]);
  });

  it('mostra no campo o erro que vem do servidor', async () => {
    server.use(
      respondendoOnboarding({ answers: { goal: 'ganhar-massa' } }),
      http.patch(url('/profile/steps/dados'), () =>
        erroDaApi(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', { errors: { weight_kg: ['Use um peso entre 30 e 250 kg, com até uma casa decimal.'] } }),
      ),
    );

    renderizar(<EtapaDados />);
    const usuario = await preencher();
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('Use um peso entre 30 e 250 kg, com até uma casa decimal.')).toBeInTheDocument();
    expect(screen.getByLabelText('Peso de hoje')).toHaveAttribute('aria-invalid', 'true');
    expect(roteador.push).not.toHaveBeenCalled();
  });

  it('sem rede, avisa e não perde o que foi digitado', async () => {
    server.use(respondendoOnboarding({ answers: { goal: 'ganhar-massa' } }), http.patch(url('/profile/steps/dados'), () => HttpResponse.error()));

    renderizar(<EtapaDados />);
    const usuario = await preencher();
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar. Tente de novo.');
    expect(screen.getByLabelText('Idade')).toHaveValue('27');
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });

  it('quem quer mais disposição não vê a meta e envia sem ela (RN10, CA05)', async () => {
    const { handler, corpos } = gravandoEtapa('dados');
    server.use(handler, respondendoOnboarding({ answers: { goal: 'mais-disposicao' } }));

    renderizar(<EtapaDados />);
    const usuario = await preencher('70', '');

    expect(screen.queryByLabelText('Meta de peso (opcional)')).not.toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));
    await waitFor(() => expect(corpos).toEqual([expect.objectContaining({ weight_kg: 70, goal_weight_kg: null })]));
  });
});
