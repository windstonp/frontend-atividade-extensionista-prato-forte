import { ApiError } from '@/lib/api/errors';
import type { StatusDoPlano } from './tipos';

/** Segunda a domingo da semana de `hojeIso` (YYYY-MM-DD), sem depender do fuso do aparelho. */
export function semanaDe(hojeIso: string): string[] {
  const [a, m, d] = hojeIso.split('-').map(Number);
  const hoje = new Date(Date.UTC(a, m - 1, d));
  const segunda = new Date(hoje);
  segunda.setUTCDate(hoje.getUTCDate() - ((hoje.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(segunda);
    dia.setUTCDate(segunda.getUTCDate() + i);
    return dia.toISOString().slice(0, 10);
  });
}

/** "a, b e c". */
export function juntarComE(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? '';
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

/** O 409 `NO_ACTIVE_PLAN` diz o status do último plano (gerando, falhou ou nenhum). */
export function planoSemAtivo(erro: unknown): { status: StatusDoPlano | null; planId: number | null } | null {
  if (!(erro instanceof ApiError) || erro.code !== 'NO_ACTIVE_PLAN') return null;
  return {
    status: (erro.details.planStatus as StatusDoPlano | null | undefined) ?? null,
    planId: (erro.details.planId as number | null | undefined) ?? null,
  };
}

/** Sem plano ativo: gerando/na fila → "quase pronto"; falhou ou nunca teve → "Tentar de novo". */
export const estadoSemPlano = (status: StatusDoPlano | null): 'gerando' | 'falhou' =>
  status === 'generating' || status === 'pending' ? 'gerando' : 'falhou';
