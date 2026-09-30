import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { diaApi } from '@/mocks/fixtures/dia';
import { conversaApi, mensagemUsuarioApi, respostaTrocaApi } from '@/mocks/fixtures/nutri';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { respondendoMensagens } from '@/mocks/handlers/nutri';
import { server } from '@/mocks/server';
import { definirUrl, redefinirNavegacao } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { ChatTela } from './ChatTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

const conversa = (id = 5, vazia = false) => http.get(url(`/conversations/${id}`), () => HttpResponse.json({ data: conversaApi(id, { vazia }) }));
const respondendoPergunta = (resposta = respostaTrocaApi(12)) =>
  http.post(url('/conversations/5/messages'), async ({ request }) => {
    const { content } = (await request.json()) as { content: string };
    return HttpResponse.json({ data: { user_message: mensagemUsuarioApi(11, content), assistant_message: resposta } }, { status: 201 });
  });

beforeEach(() => {
  redefinirNavegacao();
  definirUrl('/nutri/5');
});

describe('Chat do Nutri (S14)', () => {
  it('conversa vazia: saudação, contexto e perguntas prontas', async () => {
    server.use(conversa(5, true), respondendoMensagens(5, []));

    renderizar(<ChatTela id={5} />);

    expect(await screen.findByRole('heading', { name: 'No que posso ajudar, Camila?' })).toBeInTheDocument();
    expect(await screen.findByText('Sua alergia a amendoim e castanhas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'O que comer antes do treino das 19:00?' })).toBeInTheDocument();
  });

  it('?pergunta= chega no campo sem enviar (RF19)', async () => {
    definirUrl(`/nutri/5?pergunta=${encodeURIComponent('Não tenho frango em casa')}`);
    let enviou = false;
    server.use(conversa(5, true), respondendoMensagens(5, []), http.post(url('/conversations/5/messages'), () => { enviou = true; return HttpResponse.json({}); }));

    renderizar(<ChatTela id={5} />);

    expect(await screen.findByLabelText('Escreva sua pergunta para o Nutri')).toHaveValue('Não tenho frango em casa');
    expect(enviou).toBe(false);
  });

  it('pergunta, mostra a resposta com cartão e chips; tocar num chip envia (RF20, CA13)', async () => {
    server.use(conversa(5, true), respondendoMensagens(5, []), respondendoPergunta());
    const usuario = userEvent.setup();

    renderizar(<ChatTela id={5} />);
    await usuario.type(await screen.findByLabelText('Escreva sua pergunta para o Nutri'), 'Posso trocar o arroz por batata?');
    await usuario.click(screen.getByRole('button', { name: 'Enviar pergunta' }));

    expect(await screen.findByRole('group', { name: 'De arroz branco cozido para batata-doce cozida' })).toBeInTheDocument();
    expect(screen.getByText('Posso trocar o arroz por batata?')).toBeInTheDocument();
    const chips = screen.getByRole('group', { name: 'Sugestões de pergunta' });
    await usuario.click(within(chips).getByRole('button', { name: 'E no jantar, o que como?' }));
    expect(await screen.findByText('E no jantar, o que como?', { selector: 'p' })).toBeInTheDocument();
  });

  it('IA fora: "Não enviada", sem chips; "Tentar de novo" reenvia (CA09)', async () => {
    let tentativas = 0;
    server.use(
      conversa(5, true),
      respondendoMensagens(5, []),
      http.post(url('/conversations/5/messages'), async ({ request }) => {
        tentativas++;
        if (tentativas === 1) return erroDaApi(503, 'AI_UNAVAILABLE', 'O Nutri não respondeu agora. Tente de novo.');
        const { content } = (await request.json()) as { content: string };
        return HttpResponse.json({ data: { user_message: mensagemUsuarioApi(11, content), assistant_message: respostaTrocaApi(12) } }, { status: 201 });
      }),
    );
    const usuario = userEvent.setup();

    renderizar(<ChatTela id={5} />);
    await usuario.type(await screen.findByLabelText('Escreva sua pergunta para o Nutri'), 'Oi');
    await usuario.click(screen.getByRole('button', { name: 'Enviar pergunta' }));

    expect(await screen.findByText('Não enviada')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Sugestões de pergunta' })).toBeNull();
    await usuario.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('group', { name: /De arroz branco cozido/ })).toBeInTheDocument();
    expect(screen.queryByText('Não enviada')).toBeNull();
  });

  it('429 avisa quanto esperar', async () => {
    server.use(
      conversa(5, true),
      respondendoMensagens(5, []),
      http.post(url('/conversations/5/messages'), () =>
        HttpResponse.json({ message: 'x', code: 'TOO_MANY_REQUESTS', details: { retry_after: 42 } }, { status: 429 }),
      ),
    );
    const usuario = userEvent.setup();

    renderizar(<ChatTela id={5} />);
    await usuario.type(await screen.findByLabelText('Escreva sua pergunta para o Nutri'), 'Oi');
    await usuario.click(screen.getByRole('button', { name: 'Enviar pergunta' }));

    expect(await screen.findByText('Muitas perguntas seguidas. Tente de novo em 42 segundos.')).toBeInTheDocument();
  });

  it('aplicar a troca: ações somem, confirmação entra e o toast oferece "Desfazer" (RF21, CA05)', async () => {
    server.use(
      conversa(5),
      respondendoMensagens(5, [respostaTrocaApi(12), mensagemUsuarioApi(11)]),
      http.post(url('/messages/12/actions/0'), () =>
        HttpResponse.json({
          data: {
            message: { id: 12, actions: [], actions_available: false },
            confirmation: {
              id: 13, role: 'assistant', content: 'Feito. Seu almoço de hoje vai com batata-doce cozida.', created_at: '2026-10-01T11:03:00-03:00',
              follow_up: null, follow_up_suggestions: [], card: null,
              actions: [{ index: 0, kind: 'ver-refeicao', label: 'Ver a refeição', slot: 'almoco' }], actions_available: true, rating: null,
            },
            day: diaApi({ ultimaAlteracao: { id: 3, text: 'Arroz branco cozido trocado por batata-doce cozida' } }),
          },
        }),
      ),
    );
    const usuario = userEvent.setup();

    renderizar(<ChatTela id={5} />);
    await usuario.click(await screen.findByRole('button', { name: 'Substituir no almoço de hoje' }));

    expect(await screen.findByText('Feito. Seu almoço de hoje vai com batata-doce cozida.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Substituir no almoço de hoje' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Ver a refeição' })).toHaveAttribute('href', '/dieta/almoco');
    expect(await screen.findByText('Arroz branco cozido trocado por batata-doce cozida')).toBeInTheDocument();
  });

  it('duplo toque em "Substituir" faz uma requisição só', async () => {
    let chamadas = 0;
    server.use(
      conversa(5),
      respondendoMensagens(5, [respostaTrocaApi(12), mensagemUsuarioApi(11)]),
      http.post(url('/messages/12/actions/0'), async () => {
        chamadas++;
        await new Promise((r) => setTimeout(r, 100));
        return HttpResponse.json({ data: { message: { id: 12, actions: [], actions_available: false } } });
      }),
    );
    const usuario = userEvent.setup();

    renderizar(<ChatTela id={5} />);
    const botao = await screen.findByRole('button', { name: 'Substituir no almoço de hoje' });
    await usuario.dblClick(botao);

    await waitFor(() => expect(screen.queryByRole('button', { name: /Substituir no almoço de hoje/ })).toBeNull());
    expect(chamadas).toBe(1);
  });

  it('ação que já expirou avisa e some (CA08)', async () => {
    server.use(
      conversa(5),
      respondendoMensagens(5, [respostaTrocaApi(12), mensagemUsuarioApi(11)]),
      http.post(url('/messages/12/actions/0'), () => erroDaApi(409, 'ACTION_EXPIRED', 'Essa sugestão era para 30/09.')),
    );

    renderizar(<ChatTela id={5} />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Substituir no almoço de hoje' }));

    expect(await screen.findByText('Essa sugestão era para 30/09.')).toBeInTheDocument();
  });

  it('"Ver outras opções" manda a pergunta', async () => {
    let perguntou = '';
    server.use(
      conversa(5),
      respondendoMensagens(5, [respostaTrocaApi(12), mensagemUsuarioApi(11)]),
      http.post(url('/conversations/5/messages'), async ({ request }) => {
        perguntou = ((await request.json()) as { content: string }).content;
        return HttpResponse.json({ data: { user_message: mensagemUsuarioApi(13, perguntou), assistant_message: respostaTrocaApi(14) } }, { status: 201 });
      }),
    );

    renderizar(<ChatTela id={5} />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Ver outras opções' }));

    await waitFor(() => expect(perguntou).toBe('Quero ver outras opções'));
  });

  it('conversa que não existe: "Conversa não encontrada" com "Ver conversas"', async () => {
    server.use(
      http.get(url('/conversations/5'), () => erroDaApi(404, 'NOT_FOUND', 'Não encontrado.')),
      http.get(url('/conversations/5/messages'), () => erroDaApi(404, 'NOT_FOUND', 'Não encontrado.')),
    );

    renderizar(<ChatTela id={5} />);

    expect(await screen.findByRole('heading', { name: 'Conversa não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver conversas' })).toHaveAttribute('href', '/nutri');
  });

  it('mensagens antigas carregam por botão', async () => {
    server.use(
      conversa(5),
      http.get(url('/conversations/5/messages'), ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        return HttpResponse.json(
          cursor
            ? { data: [mensagemUsuarioApi(1, 'A primeira pergunta')], meta: { next_cursor: null, per_page: 30 } }
            : { data: [respostaTrocaApi(12, { acoes: false }), mensagemUsuarioApi(11)], meta: { next_cursor: 'c1', per_page: 30 } },
        );
      }),
    );

    renderizar(<ChatTela id={5} />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Ver mensagens anteriores' }));

    expect(await screen.findByText('A primeira pergunta')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver mensagens anteriores' })).toBeNull();
  });

  it('carregar mensagens antigas não joga a tela para o fim', async () => {
    const rolar = vi.fn();
    Element.prototype.scrollIntoView = rolar;
    server.use(
      conversa(5),
      http.get(url('/conversations/5/messages'), ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        return HttpResponse.json(
          cursor
            ? { data: [mensagemUsuarioApi(1, 'A primeira pergunta')], meta: { next_cursor: null, per_page: 30 } }
            : { data: [respostaTrocaApi(12, { acoes: false }), mensagemUsuarioApi(11)], meta: { next_cursor: 'c1', per_page: 30 } },
        );
      }),
    );

    renderizar(<ChatTela id={5} />);
    const anteriores = await screen.findByRole('button', { name: 'Ver mensagens anteriores' });
    rolar.mockClear();
    await userEvent.setup().click(anteriores);
    await screen.findByText('A primeira pergunta');

    expect(rolar).not.toHaveBeenCalled();
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });

  it('erro ao carregar a conversa: ErrorState com "Tentar de novo"', async () => {
    let tentativas = 0;
    server.use(
      conversa(5),
      http.get(url('/conversations/5/messages'), () => {
        tentativas++;
        return tentativas === 1 ? erroDaApi(500, 'SERVER_ERROR', 'x') : HttpResponse.json({ data: [mensagemUsuarioApi(11, 'Voltou')], meta: { next_cursor: null, per_page: 30 } });
      }),
    );

    renderizar(<ChatTela id={5} />);
    expect(await screen.findByText('Não foi possível carregar a conversa')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Voltou')).toBeInTheDocument();
  });

  it('conversa apagada em outra aba durante o chat: enviar leva a "Conversa não encontrada"', async () => {
    server.use(conversa(5, true), respondendoMensagens(5, []), http.post(url('/conversations/5/messages'), () => erroDaApi(404, 'NOT_FOUND', 'Não encontrado.')));
    const usuario = userEvent.setup();

    renderizar(<ChatTela id={5} />);
    await usuario.type(await screen.findByLabelText('Escreva sua pergunta para o Nutri'), 'Oi');
    await usuario.click(screen.getByRole('button', { name: 'Enviar pergunta' }));

    expect(await screen.findByRole('heading', { name: 'Conversa não encontrada' })).toBeInTheDocument();
  });

  it('erro do servidor ao enviar não finge falta de internet: avisa e devolve a pergunta ao campo', async () => {
    server.use(conversa(5, true), respondendoMensagens(5, []), http.post(url('/conversations/5/messages'), () => erroDaApi(500, 'SERVER_ERROR', 'Algo deu errado do nosso lado. Tente de novo.')));
    const usuario = userEvent.setup();

    renderizar(<ChatTela id={5} />);
    await usuario.type(await screen.findByLabelText('Escreva sua pergunta para o Nutri'), 'Oi');
    await usuario.click(screen.getByRole('button', { name: 'Enviar pergunta' }));

    expect(await screen.findByText('Algo deu errado do nosso lado. Tente de novo.')).toBeInTheDocument();
    expect(screen.queryByText('Sem conexão')).toBeNull();
    expect(screen.getByLabelText('Escreva sua pergunta para o Nutri')).toHaveValue('Oi');
  });

  it('o histórico não é anunciado inteiro; a resposta nova é', async () => {
    server.use(conversa(5, true), respondendoMensagens(5, []), respondendoPergunta());
    const usuario = userEvent.setup();

    renderizar(<ChatTela id={5} />);
    await usuario.type(await screen.findByLabelText('Escreva sua pergunta para o Nutri'), 'Posso trocar o arroz por batata?');
    await usuario.click(screen.getByRole('button', { name: 'Enviar pergunta' }));

    expect(screen.getByRole('main')).not.toHaveAttribute('aria-live');
    expect(await screen.findByText(/^O Nutri respondeu: Pode\. No seu almoço/)).toHaveAttribute('aria-live', 'polite');
  });

  it('avaliar a resposta: 👍 marca e vai para a API (CA01)', async () => {
    let corpo: unknown;
    server.use(
      conversa(5),
      respondendoMensagens(5, [{ ...respostaTrocaApi(12, { acoes: false }), rating: null }, mensagemUsuarioApi(11)]),
      http.put(url('/ratings'), async ({ request }) => ((corpo = await request.json()), HttpResponse.json({ data: {} }))),
    );

    renderizar(<ChatTela id={5} />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Resposta útil' }));

    await waitFor(() => expect(corpo).toEqual({ rateable_type: 'nutri_message', rateable_id: 12, value: 'up', comment: null }));
    expect(screen.getByRole('button', { name: 'Resposta útil' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('avaliação salva volta marcada ao abrir a conversa', async () => {
    server.use(conversa(5), respondendoMensagens(5, [{ ...respostaTrocaApi(12, { acoes: false }), rating: { value: 'down', comment: 'x' } }, mensagemUsuarioApi(11)]));

    renderizar(<ChatTela id={5} />);

    expect(await screen.findByRole('button', { name: 'Resposta não ajudou' })).toHaveAttribute('aria-pressed', 'true');
  });
});
