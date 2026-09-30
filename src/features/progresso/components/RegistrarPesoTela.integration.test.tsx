import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usuarioApi } from '@/mocks/fixtures/usuario';
import { CHAVES } from '@/lib/chaves';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao, roteador } from '@/test/next-navigation';
import { novoClienteDeTeste, renderizar } from '@/test/renderizar';
import { hojeLocal } from '../regras';
import { RegistrarPesoTela } from './RegistrarPesoTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

const salvando = (registro: { corpo?: unknown; vezes: number }, atraso = 0) =>
  http.post(url('/weigh-ins'), async ({ request }) => {
    registro.vezes++;
    registro.corpo = await request.json();
    await new Promise((r) => setTimeout(r, atraso));
    return HttpResponse.json({ data: { id: 9, date: hojeLocal(), weight_kg: 58.6 }, meta: { replaced: false } }, { status: 201 });
  });

describe('Registrar peso (S16)', () => {
  it('começa na última pesagem, ajusta, compara e salva voltando para a Evolução (RF23)', async () => {
    const registro = { vezes: 0 } as { corpo?: unknown; vezes: number };
    server.use(salvando(registro));
    const cliente = novoClienteDeTeste();
    const invalidar = vi.spyOn(cliente, 'invalidateQueries');
    const usuario = userEvent.setup();

    renderizar(<RegistrarPesoTela />, cliente);
    expect(await screen.findByRole('button', { name: 'Digitar o peso: 58,4 kg' })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Aumentar 100 gramas' }));
    await usuario.click(screen.getByRole('button', { name: 'Aumentar 100 gramas' }));

    expect(screen.getByText('São 200 g a mais que na última pesagem. Dentro do esperado para quem está ganhando massa.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    await usuario.click(screen.getByRole('button', { name: 'Salvar peso de hoje' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/evolucao'));
    expect(registro.corpo).toEqual({ weight_kg: 58.6 });
    expect(invalidar.mock.calls.map(([f]) => JSON.stringify(f?.queryKey))).toContain(JSON.stringify(CHAVES.perfil));
  });

  it('duplo toque em salvar: uma requisição só', async () => {
    const registro = { vezes: 0 } as { corpo?: unknown; vezes: number };
    server.use(salvando(registro, 150));
    const usuario = userEvent.setup();

    renderizar(<RegistrarPesoTela />);
    await usuario.dblClick(await screen.findByRole('button', { name: 'Salvar peso de hoje' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalled());
    expect(registro.vezes).toBe(1);
  });

  it('já pesou hoje: avisa que vai atualizar', async () => {
    server.use(http.get(url('/weigh-ins'), () => HttpResponse.json({ data: [{ id: 1, date: hojeLocal(), weight_kg: 58.4 }] })));

    renderizar(<RegistrarPesoTela />);

    expect(await screen.findByText('Você já registrou hoje. Salvar vai atualizar o valor.')).toBeInTheDocument();
  });

  it('sem pesagens: começa no peso inicial do perfil e sem histórico', async () => {
    server.use(http.get(url('/weigh-ins'), () => HttpResponse.json({ data: [] })));

    renderizar(<RegistrarPesoTela />);

    expect(await screen.findByRole('button', { name: 'Digitar o peso: 56,8 kg' })).toBeInTheDocument();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('erro ao salvar: fica na tela, avisa e o botão volta', async () => {
    server.use(http.post(url('/weigh-ins'), () => erroDaApi(500, 'SERVER_ERROR', 'Algo deu errado do nosso lado. Tente de novo.')));
    const usuario = userEvent.setup();

    renderizar(<RegistrarPesoTela />);
    await usuario.click(await screen.findByRole('button', { name: 'Salvar peso de hoje' }));

    expect(await screen.findByText('Algo deu errado do nosso lado. Tente de novo.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar peso de hoje' })).toBeEnabled();
    expect(roteador.push).not.toHaveBeenCalled();
  });

  it('imperial: mostra lb e manda kg (130 lb → 59,0 kg, CA06)', async () => {
    const registro = { vezes: 0 } as { corpo?: unknown; vezes: number };
    server.use(salvando(registro), http.get(url('/me'), () => HttpResponse.json({ data: { ...usuarioApi, settings: { unit_system: 'imperial' } } })));
    const usuario = userEvent.setup();

    renderizar(<RegistrarPesoTela />);
    await usuario.click(await screen.findByRole('button', { name: 'Digitar o peso: 128,7 lb' }));
    await usuario.keyboard('130{Enter}');
    expect(screen.getByRole('button', { name: 'Digitar o peso: 130,0 lb' })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Salvar peso de hoje' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/evolucao'));
    expect(registro.corpo).toEqual({ weight_kg: 59 });
  });
});
