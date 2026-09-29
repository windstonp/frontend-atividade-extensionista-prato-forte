import type { EtapaOnboarding } from '@/lib/types';

/** Ordem do fluxo (RN08). */
export const ETAPAS: EtapaOnboarding[] = ['objetivo', 'dados', 'atividade', 'preferencias', 'restricoes', 'rotina', 'resumo'];
export const TOTAL_ETAPAS = ETAPAS.length;

export const numeroDaEtapa = (etapa: EtapaOnboarding) => ETAPAS.indexOf(etapa) + 1;
export const etapaAnterior = (etapa: EtapaOnboarding): EtapaOnboarding | null => ETAPAS[ETAPAS.indexOf(etapa) - 1] ?? null;
export const proximaEtapa = (etapa: EtapaOnboarding): EtapaOnboarding | null => ETAPAS[ETAPAS.indexOf(etapa) + 1] ?? null;

/** Textos do mock (🔵) de cada etapa. */
export const TEXTOS: Record<EtapaOnboarding, { titulo: string; descricao: string }> = {
  objetivo: { titulo: 'Qual é seu objetivo agora?', descricao: 'Ele define suas calorias e a quantidade de proteína do dia.' },
  dados: { titulo: 'Agora, seus dados', descricao: 'Ficam só no seu perfil. Ninguém da academia vê.' },
  atividade: { titulo: 'Quantas vezes você treina?', descricao: 'Conte só o que acontece de verdade numa semana comum.' },
  preferencias: { titulo: 'O que costuma ter na sua cozinha?', descricao: 'Marque o que você come sem reclamar. Seu cardápio sai daqui.' },
  restricoes: { titulo: 'Tem algo que você não pode comer?', descricao: 'O Nutri nunca sugere um alimento marcado aqui, nem nas substituições.' },
  rotina: { titulo: 'Como é o seu dia?', descricao: 'Os horários das refeições saem daqui, inclusive o pré-treino.' },
  resumo: { titulo: 'Confere se está certo', descricao: 'Qualquer linha pode ser ajustada agora ou depois, no perfil.' },
};
