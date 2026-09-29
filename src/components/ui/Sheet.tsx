"use client";

import { useEffect, useId, useRef, useState } from "react";

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Folha que sobe de baixo. Fica montada durante a saída para a animação
 * de fechamento terminar antes de sumir. Prende o foco e devolve a quem abriu.
 */
export function Sheet({
  aberta,
  aoFechar,
  titulo,
  descricao,
  tom = "padrao",
  children,
}: {
  aberta: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  tom?: "padrao" | "destrutivo";
  children: React.ReactNode;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const idTitulo = useId();
  const idDescricao = useId();
  const [montada, setMontada] = useState(aberta);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (aberta) {
      setMontada(true);
      setSaindo(false);
      return;
    }
    if (!montada) return;
    setSaindo(true);
    const t = setTimeout(() => {
      setMontada(false);
      setSaindo(false);
    }, 240);
    return () => clearTimeout(t);
  }, [aberta, montada]);

  useEffect(() => {
    if (!aberta) return;
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        aoFechar();
        return;
      }
      if (e.key !== "Tab" || !caixa.current) return;
      const focaveis = caixa.current.querySelectorAll<HTMLElement>(FOCAVEIS);
      if (focaveis.length === 0) {
        e.preventDefault();
        return;
      }
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      const atual = document.activeElement;
      if (e.shiftKey && (atual === primeiro || atual === caixa.current)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && atual === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener("keydown", aoTeclar);
    caixa.current?.focus();
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      anterior?.focus();
    };
  }, [aberta, aoFechar]);

  if (!montada) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[430px] flex-col justify-end">
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={aoFechar}
        className={`absolute inset-0 bg-tinta/55 backdrop-blur-[2px] transition-opacity duration-240 active:scale-100 ${
          saindo ? "opacity-0" : "animate-fade opacity-100"
        }`}
      />
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={descricao ? idDescricao : undefined}
        tabIndex={-1}
        className={`relative max-h-[86dvh] overflow-y-auto rounded-t-[26px] bg-white px-5 pt-2.5 pb-7 shadow-[0_-1px_2px_rgba(21,37,28,.06),0_-18px_44px_-14px_rgba(21,37,28,.38)] outline-none area-segura-baixo ${
          saindo ? "translate-y-full transition-transform duration-240 ease-in" : "animate-folha"
        }`}
      >
        <span className="mx-auto mb-4 block h-1 w-9 rounded-full bg-linha" />
        <h2
          id={idTitulo}
          className={`animate-entra font-display text-[22px] font-bold tracking-[-0.025em] ${
            tom === "destrutivo" ? "text-alerta" : ""
          }`}
        >
          {titulo}
        </h2>
        {descricao ? (
          <p
            id={idDescricao}
            className="mt-1.5 animate-entra text-[13.5px] leading-normal text-fumo"
            style={{ animationDelay: "60ms" }}
          >
            {descricao}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
