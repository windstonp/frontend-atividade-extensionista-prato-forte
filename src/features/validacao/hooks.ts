'use client';

import { type InfiniteData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toaster';
import { comoApiError } from '@/lib/api/errors';
import * as validacao from '@/lib/api/validacao';
import { CHAVES } from '@/lib/chaves';
import type { Plano } from '@/features/dia/tipos';
import type { Mensagem, Pagina } from '@/features/nutri/tipos';
import type { Alvo, Avaliacao, StatusUsabilidade, ValorAvaliacao } from './tipos';

/**
 * 👍/👎 de uma resposta ou do plano (RF31): muda na hora; um pedido por vez. Se um pedido falhar e não
 * houver outro depois dele, volta ao último valor que o servidor aceitou e avisa. O que foi aceito vai
 * para o cache da conversa/do plano, para a tela voltar marcada ao navegar de volta (CA01).
 */
export function useAvaliacao(alvo: Alvo, inicial: Avaliacao | null) {
  const avisar = useToast();
  const cliente = useQueryClient();
  const [valor, setValor] = useState<Avaliacao | null>(inicial);
  const [pendentes, setPendentes] = useState(0);
  const atual = useRef(inicial); // o que a tela mostra agora (toques no mesmo instante)
  const confirmado = useRef(inicial); // o último valor que o servidor aceitou
  const emVoo = useRef(0);
  const fila = useRef<Promise<unknown>>(Promise.resolve());

  function gravarNoCache(novo: Avaliacao | null) {
    if (alvo.tipo === 'meal_plan') {
      cliente.setQueryData<Plano>(CHAVES.plano(alvo.id), (p) => (p ? { ...p, rating: novo } : p));
      return;
    }
    cliente.setQueriesData<InfiniteData<Pagina<Mensagem>>>({ queryKey: ['mensagens'] }, (dados) =>
      dados
        ? {
            ...dados,
            pages: dados.pages.map((pg) => ({
              ...pg,
              data: pg.data.map((m) => (m.id === alvo.id && m.role === 'assistant' ? { ...m, rating: novo } : m)),
            })),
          }
        : dados,
    );
  }

  function salvar(novo: Avaliacao | null) {
    atual.current = novo;
    setValor(novo);
    emVoo.current += 1;
    setPendentes(emVoo.current);
    fila.current = fila.current.then(async () => {
      try {
        await (novo ? validacao.avaliar(alvo, novo.value, novo.comment) : validacao.removerAvaliacao(alvo));
        confirmado.current = novo;
        gravarNoCache(novo);
      } catch (erro) {
        if (emVoo.current === 1) {
          atual.current = confirmado.current;
          setValor(confirmado.current);
          avisar({ texto: comoApiError(erro).message });
        }
      } finally {
        emVoo.current -= 1;
        setPendentes(emVoo.current);
      }
    });
  }

  return {
    valor,
    salvando: pendentes > 0,
    marcar: (v: ValorAvaliacao) => salvar(atual.current?.value === v ? null : { value: v, comment: null }),
    comentar: (texto: string) => salvar({ value: 'down', comment: texto.trim() || null }),
  };
}

export const useStatusUsabilidade = () => useQuery({ queryKey: CHAVES.usabilidade, queryFn: validacao.getStatusUsabilidade });

export function useResponderQuestionario() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: validacao.responderQuestionario,
    onSuccess: () => cliente.setQueryData<StatusUsabilidade>(CHAVES.usabilidade, (s) => (s ? { ...s, responded: true, invite: false } : s)),
  });
}

/** "Agora não": o convite some na hora (RF32). */
export function useDispensarConvite() {
  const cliente = useQueryClient();
  const avisar = useToast();
  return useMutation({
    mutationFn: validacao.dispensarConvite,
    onMutate: () => cliente.setQueryData<StatusUsabilidade>(CHAVES.usabilidade, (s) => (s ? { ...s, invite: false } : s)),
    // Falhou: o convite volta (senão reaparece sozinho na próxima visita, sem explicação).
    onError: () => {
      cliente.setQueryData<StatusUsabilidade>(CHAVES.usabilidade, (s) => (s ? { ...s, invite: true } : s));
      avisar({ texto: 'Não deu para esconder o convite agora. Tente de novo.' });
    },
  });
}
