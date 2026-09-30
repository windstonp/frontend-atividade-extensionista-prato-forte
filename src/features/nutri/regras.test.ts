import { describe, expect, it } from 'vitest';
import { camelizar } from '@/lib/api/case';
import { mensagemUsuarioApi, respostaRefeicaoApi, respostaTrocaApi } from '@/mocks/fixtures/nutri';
import { juntarPaginas, perguntaDaAcao, perguntaDaUrl, quando, ultimasSugestoes } from './regras';
import type { Mensagem, MensagemNutri } from './tipos';

const m = <T,>(v: unknown) => camelizar<T>(v);

describe('juntarPaginas', () => {
  it('páginas vêm mais recentes primeiro; o chat mostra em ordem e sem repetir', () => {
    const p1 = [m<Mensagem>(respostaTrocaApi(4)), m<Mensagem>(mensagemUsuarioApi(3))];
    const p2 = [m<Mensagem>(mensagemUsuarioApi(3)), m<Mensagem>(respostaTrocaApi(2)), m<Mensagem>(mensagemUsuarioApi(1))];

    expect(juntarPaginas([p1, p2]).map((x) => x.id)).toEqual([1, 2, 3, 4]);
  });
});

describe('perguntaDaAcao', () => {
  it('"outra opção" vira pergunta; o resto não', () => {
    const troca = m<MensagemNutri>(respostaTrocaApi(2));
    const refeicao = m<MensagemNutri>(respostaRefeicaoApi(3));
    expect(perguntaDaAcao(troca.actions[1], troca)).toBe('Quero ver outras opções');
    expect(perguntaDaAcao(refeicao.actions[1], refeicao)).toBe('Monte outra opção de jantar');
    expect(perguntaDaAcao(troca.actions[0], troca)).toBeNull();
  });
});

describe('quando', () => {
  const agora = new Date('2026-10-01T15:00:00-03:00');
  it.each([
    ['2026-10-01T09:00:00-03:00', 'hoje'],
    ['2026-09-30T22:00:00-03:00', 'ontem'],
    ['2026-09-28T10:00:00-03:00', 'segunda'],
    ['2026-09-20T10:00:00-03:00', '20/09'],
  ])('%s → %s', (iso, esperado) => expect(quando(iso, agora)).toBe(esperado));
});

describe('perguntaDaUrl e ultimasSugestoes', () => {
  it('corta em 200 e tira espaços', () => {
    expect(perguntaDaUrl(`  ${'a'.repeat(5000)}  `)).toHaveLength(200);
    expect(perguntaDaUrl(null)).toBe('');
    expect(perguntaDaUrl('<b>oi</b>')).toBe('<b>oi</b>'); // vira texto no campo, nunca HTML
  });

  it('chips são os da última resposta do Nutri', () => {
    const lista = juntarPaginas([[m<Mensagem>(respostaTrocaApi(2)), m<Mensagem>(mensagemUsuarioApi(1))]]);
    expect(ultimasSugestoes(lista)).toEqual(['E no jantar, o que como?', 'Por que a batata segura mais a fome?']);
    expect(ultimasSugestoes([])).toEqual([]);
  });
});
