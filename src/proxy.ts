import { NextResponse, type NextRequest } from 'next/server';

/** Cookie de sessão do Laravel (`Str::slug(APP_NAME).'-session'`). */
const COOKIE_SESSAO = process.env.SESSION_COOKIE_NAME ?? 'prato-forte-session';

/**
 * Primeira barreira de UX (spec 00, autenticação §4): sem cookie de sessão, nem abre a tela.
 * Com cookie, deixa passar — a autoridade é `GET /me` no `AuthGate`.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE_SESSAO)) return NextResponse.next();

  const login = new URL('/entrar', request.url);
  login.searchParams.set('voltar', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    '/hoje/:path*',
    '/dieta/:path*',
    '/nutri/:path*',
    '/evolucao/:path*',
    '/perfil/:path*',
    '/onboarding/:path*',
  ],
};
