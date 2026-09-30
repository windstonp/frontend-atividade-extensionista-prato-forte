import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { conversaApi } from '@/mocks/fixtures/nutri';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao, roteador } from '@/test/next-navigation';
import { CHAVES } from '@/lib/chaves';
import { novoClienteDeTeste, renderizar } from '@/test/renderizar';
import { ConversasTela } from './ConversasTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

const comConversas = (...ids: number[]) =>
  server.use(http.get(url('/conversations'), () => HttpResponse.json({ data: ids.map((id) => conversaApi(id, { titulo: `Conversa ${id}` })), meta: { next_cursor: null, per_page: 15 } })));

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/nutri');
});

describe('Conversas (N05)', () => {
  it('sem conversas, abre direto uma nova levando a pergunta (CA01)', async () => {
    definirUrl(`/nutri?pergunta=${encodeURIComponent('Não tenho frango em casa')}`);
    server.use(http.post(url('/conversations'), () => HttpResponse.json({ data: conversaApi(7, { vazia: true }) }, { status: 201 })));

    renderizar(<ConversasTela />);

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith(`/nutri/7?pergunta=${encodeURIComponent('Não tenho frango em casa')}`));
  });

  it('com conversas, mostra "Nova conversa" e a lista; a pergunta vai junto (CA02)', async () => {
    definirUrl(`/nutri?pergunta=${encodeURIComponent('E no jantar?')}`);
    comConversas(3, 2);

    renderizar(<ConversasTela />);

    expect(await screen.findByRole('heading', { name: 'Conversas com o Nutri' })).toBeInTheDocument();
    expect(screen.getByText('Sua pergunta: “E no jantar?”. Escolha onde perguntar.')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Conversa 3/ })).toHaveAttribute('href', `/nutri/3?pergunta=${encodeURIComponent('E no jantar?')}`);
  });

  it('lista vazia guardada no cache não pula para uma conversa nova antes de conferir no servidor', async () => {
    comConversas(3);
    let criou = false;
    server.use(
      http.post(url('/conversations'), () => {
        criou = true;
        return HttpResponse.json({ data: conversaApi(9, { vazia: true }) }, { status: 201 });
      }),
    );
    const cliente = novoClienteDeTeste();
    cliente.setQueryData(CHAVES.conversas, { pages: [{ data: [], meta: { nextCursor: null, perPage: 15 } }], pageParams: [null] });
    await cliente.invalidateQueries({ queryKey: CHAVES.conversas });

    renderizar(<ConversasTela />, cliente);

    expect(await screen.findByRole('link', { name: /Conversa 3/ })).toBeInTheDocument();
    expect(roteador.replace).not.toHaveBeenCalled();
    expect(criou).toBe(false);
  });

  it('"Nova conversa" cria e abre', async () => {
    comConversas(3);
    server.use(http.post(url('/conversations'), () => HttpResponse.json({ data: conversaApi(8, { vazia: true }) }, { status: 201 })));

    renderizar(<ConversasTela />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Nova conversa' }));

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/nutri/8'));
  });

  it('apagar pede confirmação e tira da lista (CA11)', async () => {
    comConversas(3, 2);
    let apagou = false;
    server.use(
      http.delete(url('/conversations/3'), () => {
        apagou = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const usuario = userEvent.setup();

    renderizar(<ConversasTela />);
    const linha = (await screen.findByRole('link', { name: /Conversa 3/ })).closest('li') as HTMLElement;
    await usuario.click(within(linha).getByRole('button', { name: 'Apagar' }));
    const folha = await screen.findByRole('dialog', { name: 'Apagar esta conversa?' });
    expect(within(folha).getByText('O Nutri também esquece o que foi dito nela.')).toBeInTheDocument();
    await usuario.click(within(folha).getByRole('button', { name: 'Apagar' }));

    await waitFor(() => expect(screen.queryByRole('link', { name: /Conversa 3/ })).toBeNull());
    expect(apagou).toBe(true);
  });

  it('erro ao carregar mostra ErrorState, mas "Nova conversa" continua', async () => {
    server.use(http.get(url('/conversations'), () => HttpResponse.json({ message: 'x', code: 'SERVER_ERROR' }, { status: 500 })));

    renderizar(<ConversasTela />);

    expect(await screen.findByText('Não foi possível carregar suas conversas', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova conversa' })).toBeEnabled();
  });

  it('apagar a última conversa não abre outra sozinho nem deixa a tela carregando', async () => {
    comConversas(3);
    let criou = false;
    server.use(
      http.delete(url('/conversations/3'), () => new HttpResponse(null, { status: 204 })),
      http.post(url('/conversations'), () => {
        criou = true;
        return HttpResponse.json({ data: conversaApi(9, { vazia: true }) }, { status: 201 });
      }),
    );
    const usuario = userEvent.setup();

    renderizar(<ConversasTela />);
    const linha = (await screen.findByRole('link', { name: /Conversa 3/ })).closest('li') as HTMLElement;
    await usuario.click(within(linha).getByRole('button', { name: 'Apagar' }));
    await usuario.click(within(await screen.findByRole('dialog', { name: 'Apagar esta conversa?' })).getByRole('button', { name: 'Apagar' }));

    expect(await screen.findByText('Nenhuma conversa por aqui. Comece uma nova quando quiser.')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Carregando conversas' })).toBeNull();
    expect(criou).toBe(false);
    expect(roteador.replace).not.toHaveBeenCalled();
  });

  it('sem conversas e a criação falha: avisa e deixa "Nova conversa" à mão, sem esqueleto eterno', async () => {
    server.use(http.post(url('/conversations'), () => HttpResponse.json({ message: 'Algo deu errado do nosso lado. Tente de novo.', code: 'SERVER_ERROR' }, { status: 500 })));

    renderizar(<ConversasTela />);

    expect(await screen.findByText('Nenhuma conversa por aqui. Comece uma nova quando quiser.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova conversa' })).toBeEnabled();
  });
});

