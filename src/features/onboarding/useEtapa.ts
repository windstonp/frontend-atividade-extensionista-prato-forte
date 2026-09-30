'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toaster';
import { useEfeitoNoPlano } from '@/features/dia/useEfeitoNoPlano';
import { ApiError, comoApiError, primeirasMensagens } from '@/lib/api/errors';
import { etapaAnterior, numeroDaEtapa, proximaEtapa, TEXTOS, TOTAL_ETAPAS } from './etapas';
import { useCatalogo, useDadosOnboarding, useSalvarEtapa } from './hooks';
import type { EtapaEditavel, MetaDaResposta } from './tipos';

export const AVISO_META_AJUSTADA = 'Sua meta de peso foi ajustada para o novo objetivo.';
export const ERRO_AO_SALVAR = 'Não foi possível salvar. Tente de novo.';

/**
 * Contêiner de uma etapa: carrega catálogo e respostas, salva e navega.
 * `?editar=1` (vindo do Perfil) volta ao Perfil; `?de=resumo` volta ao resumo; senão, segue o fluxo.
 */
export function useEtapa(etapa: EtapaEditavel) {
  const busca = useSearchParams();
  const router = useRouter();
  const avisar = useToast();
  const catalogo = useCatalogo();
  const dados = useDadosOnboarding();
  const salvarEtapa = useSalvarEtapa(etapa);
  const aplicarEfeito = useEfeitoNoPlano();
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<ApiError | null>(null);

  const editando = busca.get('editar') === '1';
  const deResumo = busca.get('de') === 'resumo';
  const anterior = etapaAnterior(etapa);
  const voltarPara = editando ? '/perfil' : deResumo ? '/onboarding/resumo' : anterior ? `/onboarding/${anterior}` : null;
  const destino = editando ? '/perfil' : deResumo ? '/onboarding/resumo' : `/onboarding/${proximaEtapa(etapa)}`;

  async function salvar(corpo: Record<string, unknown>) {
    if (salvarEtapa.isPending) return;
    setErrosCampo({});
    setErroGeral(null);

    let meta: MetaDaResposta;
    try {
      meta = (await salvarEtapa.mutateAsync(corpo)).meta;
    } catch (e) {
      const erro = comoApiError(e);
      if (erro.code === 'VALIDATION_ERROR') setErrosCampo(primeirasMensagens(erro.fieldErrors));
      else setErroGeral(erro.code === 'NETWORK_ERROR' ? new ApiError(0, 'NETWORK_ERROR', ERRO_AO_SALVAR) : erro);
      return;
    }

    const metaAjustada = meta.warnings.includes('GOAL_WEIGHT_RESET');
    if (editando) {
      // Pelo Perfil: o efeito no plano decide o destino (RN21); o aviso da meta tem prioridade no texto.
      aplicarEfeito(meta, metaAjustada ? { aviso: AVISO_META_AJUSTADA } : {});
      return;
    }
    if (metaAjustada) avisar({ texto: AVISO_META_AJUSTADA });
    router.push(destino);
  }

  const erroAoCarregar =
    catalogo.error || dados.error
      ? {
          aoTentarDeNovo: () => {
            void catalogo.refetch();
            void dados.refetch();
          },
        }
      : null;

  return {
    catalogo: catalogo.data,
    dados: dados.data,
    erroAoCarregar,
    editando,
    errosCampo,
    salvar,
    casca: {
      ...TEXTOS[etapa],
      numero: numeroDaEtapa(etapa),
      total: TOTAL_ETAPAS,
      voltarPara,
      rotuloBotao: editando ? 'Salvar' : 'Continuar',
      salvando: salvarEtapa.isPending,
      erroAoSalvar: erroGeral,
    },
  };
}

export type Etapa = ReturnType<typeof useEtapa>;
