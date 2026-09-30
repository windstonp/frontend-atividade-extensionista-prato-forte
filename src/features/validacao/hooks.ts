'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toaster';
import { comoApiError } from '@/lib/api/errors';
import * as validacao from '@/lib/api/validacao';
import { CHAVES } from '@/lib/chaves';
import type { Alvo, Avaliacao, StatusUsabilidade, ValorAvaliacao } from './tipos';

/**
 * 👍/👎 de uma resposta ou do plano (RF31): muda na hora; um pedido por vez; se falhar, volta e avisa.
 * Tocar no mesmo ícone de novo remove.
 */
export function useAvaliacao(alvo: Alvo, inicial: Avaliacao | null) {
  const avisar = useToast();
  const [valor, setValor] = useState<Avaliacao | null>(inicial);
  const [salvando, setSalvando] = useState(false);
  const fila = useRef<Promise<unknown>>(Promise.resolve());

  function salvar(novo: Avaliacao | null, anterior: Avaliacao | null) {
    setValor(novo);
    setSalvando(true);
    fila.current = fila.current
      .then(() => (novo ? validacao.avaliar(alvo, novo.value, novo.comment) : validacao.removerAvaliacao(alvo)))
      .catch((erro: unknown) => {
        setValor(anterior);
        avisar({ texto: comoApiError(erro).message });
      })
      .finally(() => setSalvando(false));
  }

  return {
    valor,
    salvando,
    marcar: (v: ValorAvaliacao) => salvar(valor?.value === v ? null : { value: v, comment: null }, valor),
    comentar: (texto: string) => salvar({ value: 'down', comment: texto.trim() || null }, valor),
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
  return useMutation({
    mutationFn: validacao.dispensarConvite,
    onMutate: () => cliente.setQueryData<StatusUsabilidade>(CHAVES.usabilidade, (s) => (s ? { ...s, invite: false } : s)),
  });
}
