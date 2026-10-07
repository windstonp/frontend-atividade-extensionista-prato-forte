"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** useLayoutEffect que não reclama durante a renderização no servidor. */
const useEfeitoDeLayout =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Vira `true` depois da hidratação.
 *
 * Serve para animar largura de barra e afins: o servidor e a primeira
 * renderização do cliente desenham o estado inicial (zero), e o efeito
 * dispara a transição. Sem isso, o React reclamaria de HTML diferente.
 */
export function useMontado(atraso = 0) {
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMontado(true), atraso);
    return () => clearTimeout(t);
  }, [atraso]);
  return montado;
}

function querMenosMovimento() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Conta de zero até o valor, com desaceleração. */
export function useContagem(valor: number, duracao = 900, casas = 0) {
  const [atual, setAtual] = useState(valor);
  const jaRodou = useRef(false);

  useEfeitoDeLayout(() => {
    if (querMenosMovimento()) {
      setAtual(valor);
      return;
    }
    const de = jaRodou.current ? atual : 0;
    jaRodou.current = true;
    if (de === valor) return;

    let quadro = 0;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - Math.pow(1 - t, 3);
      const bruto = de + (valor - de) * suave;
      const fator = 10 ** casas;
      setAtual(Math.round(bruto * fator) / fator);
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor, duracao, casas]);

  return atual;
}

/** Dispara quando o elemento entra na tela, uma única vez. */
export function useNaTela<T extends HTMLElement>(margem = "-40px") {
  const alvo = useRef<T>(null);
  // Sem IntersectionObserver (navegador antigo, testes): já nasce visível.
  const [visivel, setVisivel] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const el = alvo.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { rootMargin: `0px 0px ${margem} 0px` },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [margem]);

  return { alvo, visivel };
}

/** Atraso em cascata para listas. */
export const cascata = (indice: number, passo = 60, base = 0) => ({
  animationDelay: `${base + indice * passo}ms`,
});
