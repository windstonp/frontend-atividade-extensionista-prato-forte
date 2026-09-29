import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { url } from '@/mocks/handlers/auth';
import { server } from '@/mocks/server';
import { redefinirNavegacao } from '@/test/next-navigation';
import { renderizar } from '@/test/renderizar';
import { EsqueciTela } from './EsqueciTela';

vi.mock('next/navigation', () => import('@/test/next-navigation'));

beforeEach(() => redefinirNavegacao());

describe('Esqueci minha senha', () => {
  it('confirma o envio para qualquer e-mail (CA05) e manda o e-mail digitado', async () => {
    let corpo: unknown;
    server.use(
      http.post(url('/password/forgot'), async ({ request }) => {
        corpo = await request.json();
        return HttpResponse.json({ message: 'Se houver uma conta com esse e-mail, enviamos um link.' });
      }),
    );
    const usuario = userEvent.setup();

    renderizar(<EsqueciTela />);
    await usuario.type(screen.getByLabelText('E-mail'), 'ninguem@exemplo.com');
    await usuario.click(screen.getByRole('button', { name: 'Enviar link' }));

    expect(await screen.findByRole('heading', { name: 'Confira seu e-mail' })).toBeInTheDocument();
    expect(corpo).toEqual({ email: 'ninguem@exemplo.com' });
  });
});
