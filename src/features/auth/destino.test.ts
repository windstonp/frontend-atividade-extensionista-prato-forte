import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import type { User } from '@/lib/types';
import { destinoAposEntrar, destinoDoGuarda, safeRedirect } from './destino';

const concluido: User = {
  id: 7,
  name: 'Camila Réus',
  email: 'camila@exemplo.com',
  preferredName: 'Camila',
  onboardingCompleted: true,
  nextStep: null,
  createdAt: '2026-09-23T10:00:00-03:00',
};
const pelaMetade: User = { ...concluido, onboardingCompleted: false, nextStep: 'atividade' };

describe('safeRedirect', () => {
  it.each(['/hoje', '/dieta/almoco?dia=2', '/perfil/configuracoes'])('aceita caminho interno %s', (voltar) => {
    expect(safeRedirect(voltar)).toBe(voltar);
  });

  it.each([null, undefined, '', 'hoje', '//evil.com', '/\\evil.com', '/\t/evil.com', 'https://evil.com', ' /hoje'])(
    'recusa %j',
    (voltar) => {
      expect(safeRedirect(voltar)).toBeNull();
    },
  );
});

describe('destinoAposEntrar', () => {
  it('manda para a etapa pendente, ignorando o voltar (CA03)', () => {
    expect(destinoAposEntrar(pelaMetade, '/dieta')).toBe('/onboarding/atividade');
  });

  it('volta para onde estava quando o onboarding está completo (CA09)', () => {
    expect(destinoAposEntrar(concluido, '/dieta/almoco')).toBe('/dieta/almoco');
  });

  it('cai no Hoje quando o voltar não é seguro', () => {
    expect(destinoAposEntrar(concluido, '//evil.com')).toBe('/hoje');
  });
});

describe('destinoDoGuarda', () => {
  const semSessao = new ApiError(401, 'UNAUTHENTICATED', 'Sua sessão expirou. Entre de novo.');

  it('sem sessão vai para o login levando caminho e busca', () => {
    expect(destinoDoGuarda({ area: 'app', erro: semSessao, caminho: '/dieta/almoco', busca: 'dia=2' })).toBe(
      '/entrar?voltar=%2Fdieta%2Falmoco%3Fdia%3D2',
    );
  });

  it('no app com onboarding pela metade vai para a etapa', () => {
    expect(destinoDoGuarda({ area: 'app', user: pelaMetade, caminho: '/hoje', busca: '' })).toBe('/onboarding/atividade');
  });

  it('no onboarding com conta concluída vai para o Hoje', () => {
    expect(destinoDoGuarda({ area: 'onboarding', user: concluido, caminho: '/onboarding/dados', busca: '' })).toBe('/hoje');
  });

  it('deixa editar o perfil pelo onboarding com ?editar=1', () => {
    expect(destinoDoGuarda({ area: 'onboarding', user: concluido, caminho: '/onboarding/dados', busca: 'editar=1' })).toBeNull();
  });

  it('deixa ver "gerando" e "pronto" depois de concluir', () => {
    expect(destinoDoGuarda({ area: 'onboarding', user: concluido, caminho: '/onboarding/gerando', busca: '' })).toBeNull();
    expect(destinoDoGuarda({ area: 'onboarding', user: concluido, caminho: '/onboarding/pronto', busca: '' })).toBeNull();
  });

  it('não decide enquanto carrega ou em erro que não é de sessão', () => {
    expect(destinoDoGuarda({ area: 'app', caminho: '/hoje', busca: '' })).toBeNull();
    expect(destinoDoGuarda({ area: 'app', erro: new ApiError(0, 'NETWORK_ERROR', 'x'), caminho: '/hoje', busca: '' })).toBeNull();
  });
});
