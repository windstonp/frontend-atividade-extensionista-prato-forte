// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { config, proxy } from './proxy';

const pedido = (caminho: string, cookie?: string) =>
  new NextRequest(new URL(caminho, 'http://localhost:3000'), { headers: cookie ? { cookie } : {} });

describe('proxy', () => {
  it('sem cookie de sessão manda para o login guardando caminho e busca', () => {
    const resposta = proxy(pedido('/dieta/almoco?dia=2'));

    expect(resposta.status).toBe(307);
    expect(resposta.headers.get('location')).toBe('http://localhost:3000/entrar?voltar=%2Fdieta%2Falmoco%3Fdia%3D2');
  });

  it('com cookie de sessão deixa passar (quem decide é a API)', () => {
    const resposta = proxy(pedido('/hoje', 'prato-forte-session=abc'));

    expect(resposta.headers.get('location')).toBeNull();
    expect(resposta.headers.get('x-middleware-next')).toBe('1');
  });

  it('só vigia as áreas do app', () => {
    expect(config.matcher).toEqual([
      '/hoje/:path*',
      '/dieta/:path*',
      '/nutri/:path*',
      '/evolucao/:path*',
      '/perfil/:path*',
      '/onboarding/:path*',
    ]);
  });
});
