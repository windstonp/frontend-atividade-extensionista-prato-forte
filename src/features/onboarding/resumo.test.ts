import { describe, expect, it } from 'vitest';
import { camelizar } from '@/lib/api/case';
import { catalogoApi, respostasDaCamila, respostasVazias } from '@/mocks/fixtures/onboarding';
import { linhasDoResumo } from './resumo';
import type { Catalogo, Respostas } from './tipos';

const catalogo = camelizar<Catalogo>(catalogoApi);

describe('linhasDoResumo', () => {
  it('monta as seis linhas da Camila, com a alergia em destaque', () => {
    expect(linhasDoResumo(camelizar<Respostas>(respostasDaCamila), catalogo)).toEqual([
      { etapa: 'objetivo', rotulo: 'Objetivo', valor: 'Ganhar massa magra, meta 62,0 kg' },
      { etapa: 'dados', rotulo: 'Você', valor: 'Camila, 27 anos, 1,64 m, 58,4 kg' },
      { etapa: 'atividade', rotulo: 'Treino', valor: '3 ou 4 vezes na semana, às 19:00' },
      { etapa: 'preferencias', rotulo: 'Sua cozinha', valor: '3 alimentos marcados' },
      { etapa: 'restricoes', rotulo: 'Restrições', valor: 'Amendoim e castanhas, camarão', alerta: true },
      { etapa: 'rotina', rotulo: 'Rotina', valor: 'Acorda 06:20, dorme 23:00. Treina seg, qua, sex. Almoço: marmita no trabalho.' },
    ]);
  });

  it('não quebra com respostas vazias', () => {
    const linhas = linhasDoResumo(camelizar<Respostas>(respostasVazias), catalogo);
    expect(linhas.map((l) => l.valor)).toEqual([
      '—',
      'Camila',
      '—',
      'Nada marcado ainda',
      'Nenhuma',
      'Acorda —, dorme —. Treina em nenhum dia marcado.',
    ]);
  });
});
