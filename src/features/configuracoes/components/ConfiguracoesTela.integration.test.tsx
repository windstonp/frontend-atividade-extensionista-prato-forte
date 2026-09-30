import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as push from '@/lib/push';
import { configuracoesApi } from '@/mocks/fixtures/configuracoes';
import { erroDaApi, url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { ConfiguracoesTela } from './ConfiguracoesTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));
vi.mock('@/lib/push', async (original) => ({
  jsonDaInscricao: (await original<typeof import('@/lib/push')>()).jsonDaInscricao,
  suportePush: vi.fn(() => 'ok'),
  inscricaoAtual: vi.fn(async () => null),
  inscrever: vi.fn(async () => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: 'BPublica', auth: 'segredo' }, contentEncoding: 'aes128gcm' })),
  cancelarInscricao: vi.fn(async () => null),
}));

const corpos: { put: unknown[]; post: unknown[] } = { put: [], post: [] };
const inscricaoDoNavegador = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/velha',
  toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/velha', keys: { p256dh: 'BVelha', auth: 'a' } }),
} as unknown as PushSubscription;

beforeEach(() => {
  vi.clearAllMocks();
  redefinirNavegacao();
  corpos.put = [];
  corpos.post = [];
  vi.mocked(push.suportePush).mockReturnValue('ok');
  vi.mocked(push.inscricaoAtual).mockResolvedValue(null);
  server.use(
    http.put(url('/settings'), async ({ request }) => {
      const corpo = (await request.json()) as { unit_system?: string; notifications?: Record<string, boolean> };
      corpos.put.push(corpo);
      return HttpResponse.json({ data: configuracoesApi({ unit_system: corpo.unit_system, ...corpo.notifications }) });
    }),
    http.post(url('/push-subscriptions'), async ({ request }) => {
      corpos.post.push(await request.json());
      return HttpResponse.json({ data: { subscribed: true } }, { status: 201 });
    }),
  );
});

describe('Configurações (S19)', () => {
  it('ligar um aviso pela primeira vez pede permissão, inscreve e salva (CA01)', async () => {
    const usuario = userEvent.setup();
    renderizar(<ConfiguracoesTela />);

    await usuario.click(await screen.findByRole('switch', { name: 'Dicas do Nutri' }));

    await waitFor(() => expect(corpos.put).toEqual([{ notifications: { tips: true } }]));
    expect(push.inscrever).toHaveBeenCalledWith('BChaveDeTeste');
    expect(corpos.post).toEqual([{ endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: 'BPublica', auth: 'segredo' }, content_encoding: 'aes128gcm' }]);
    expect(screen.getByRole('switch', { name: 'Dicas do Nutri' })).toHaveAttribute('aria-checked', 'true');
  });

  it('com inscrição neste navegador: não pede permissão, mas reenvia a inscrição (servidor pode tê-la perdido ou ser outra conta)', async () => {
    vi.mocked(push.inscricaoAtual).mockResolvedValue(inscricaoDoNavegador);
    const usuario = userEvent.setup();
    renderizar(<ConfiguracoesTela />);

    await usuario.click(await screen.findByRole('switch', { name: 'Dicas do Nutri' }));

    await waitFor(() => expect(corpos.put).toHaveLength(1));
    expect(push.inscrever).not.toHaveBeenCalled();
    expect(corpos.post).toEqual([{ endpoint: 'https://fcm.googleapis.com/fcm/send/velha', keys: { p256dh: 'BVelha', auth: 'a' }, content_encoding: 'aes128gcm' }]);
  });

  it('avisos ligados (padrão) mas este celular sem inscrição: oferece "Ativar avisos neste celular"', async () => {
    const usuario = userEvent.setup();
    renderizar(<ConfiguracoesTela />);

    await usuario.click(await screen.findByRole('button', { name: 'Ativar avisos neste celular' }));

    await waitFor(() => expect(corpos.post).toHaveLength(1));
    expect(push.inscrever).toHaveBeenCalledWith('BChaveDeTeste');
    expect(corpos.put).toEqual([]);
  });

  it('com inscrição neste celular, o botão de ativar não aparece', async () => {
    vi.mocked(push.inscricaoAtual).mockResolvedValue(inscricaoDoNavegador);
    renderizar(<ConfiguracoesTela />);

    await screen.findByRole('switch', { name: 'Dicas do Nutri' });
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('button', { name: 'Ativar avisos neste celular' })).toBeNull();
  });

  it('permissão negada: volta a desligado e explica (CA02)', async () => {
    vi.mocked(push.inscrever).mockResolvedValueOnce('negada');
    const usuario = userEvent.setup();
    renderizar(<ConfiguracoesTela />);

    await usuario.click(await screen.findByRole('switch', { name: 'Dicas do Nutri' }));

    expect(await screen.findByText('Os avisos estão bloqueados no navegador. Libere nas configurações do celular para ligar.')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Dicas do Nutri' })).toHaveAttribute('aria-checked', 'false');
    expect(corpos.put).toEqual([]);
  });

  it('desligar não pede permissão', async () => {
    const usuario = userEvent.setup();
    renderizar(<ConfiguracoesTela />);

    await usuario.click(await screen.findByRole('switch', { name: 'Lembrete de refeição' }));

    await waitFor(() => expect(corpos.put).toEqual([{ notifications: { meal_reminders: false } }]));
    expect(push.inscrever).not.toHaveBeenCalled();
  });

  it('erro no PUT: o toggle volta e avisa', async () => {
    vi.mocked(push.inscricaoAtual).mockResolvedValue(inscricaoDoNavegador);
    server.use(http.put(url('/settings'), () => erroDaApi(500, 'SERVER_ERROR', 'Algo deu errado do nosso lado. Tente de novo.')));
    const usuario = userEvent.setup();
    renderizar(<ConfiguracoesTela />);

    await usuario.click(await screen.findByRole('switch', { name: 'Dicas do Nutri' }));

    expect(await screen.findByText('Algo deu errado do nosso lado. Tente de novo.')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Dicas do Nutri' })).toHaveAttribute('aria-checked', 'false');
  });

  it('sem suporte ou servidor sem VAPID: interruptores travados com a explicação', async () => {
    vi.mocked(push.suportePush).mockReturnValue('sem-suporte');
    const { unmount } = renderizar(<ConfiguracoesTela />);
    expect(await screen.findByText('Este navegador não recebe avisos. Tente no Chrome do celular.')).toBeInTheDocument();
    unmount();

    vi.mocked(push.suportePush).mockReturnValue('ok');
    server.use(http.get(url('/settings'), () => HttpResponse.json({ data: configuracoesApi({ vapid: null }) })));
    renderizar(<ConfiguracoesTela />);
    expect(await screen.findByText('Os avisos ainda não estão disponíveis neste servidor.')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Dicas do Nutri' })).toBeDisabled();
  });

  it('medidas: escolher "Libra e polegada" salva imperial', async () => {
    const usuario = userEvent.setup();
    renderizar(<ConfiguracoesTela />);

    await usuario.click(within(await screen.findByRole('radiogroup', { name: 'Medidas' })).getByRole('radio', { name: 'Libra e polegada' }));

    await waitFor(() => expect(corpos.put).toEqual([{ unit_system: 'imperial' }]));
  });

  it('rodapé do projeto e erro ao carregar', async () => {
    renderizar(<ConfiguracoesTela />);
    expect(await screen.findByText(/^O Prato Forte é um projeto de extensão do curso de Ciência da Computação da UNINTER/)).toBeInTheDocument();
  });

  it('erro ao carregar: ErrorState', async () => {
    server.use(http.get(url('/settings'), () => erroDaApi(500, 'SERVER_ERROR', 'x')));
    renderizar(<ConfiguracoesTela />);

    expect(await screen.findByText('Não foi possível carregar suas configurações')).toBeInTheDocument();
  });
});
