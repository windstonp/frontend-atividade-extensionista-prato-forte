"use client";

import { useRef } from "react";

type PropsDoField = {
  id: string;
  label: string;
  sufixo?: string;
  ajuda?: string;
  erro?: string;
  aviso?: string;
  /** Elemento dentro da caixa, à direita (ex.: botão "Mostrar senha"). */
  acessorio?: React.ReactNode;
  style?: React.CSSProperties;
} & Omit<React.ComponentProps<"input">, "style">;

export function Field({
  id,
  label,
  sufixo,
  ajuda,
  erro,
  aviso,
  acessorio,
  className = "",
  style,
  ...resto
}: PropsDoField) {
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;
  const idMensagem = erro || aviso ? `${id}-mensagem` : undefined;
  const descritoPor = [idAjuda, idMensagem].filter(Boolean).join(" ") || undefined;
  const folgaDireita = acessorio ? 92 : sufixo ? sufixo.length * 9 + 22 : undefined;

  return (
    <div className={`group/campo ${className}`} style={style}>
      <label
        htmlFor={id}
        className="mb-[7px] block text-[12.5px] font-semibold text-fumo transition-colors duration-200 group-focus-within/campo:text-tinta"
      >
        {label}
      </label>
      {/* A caixa balança quando o erro aparece. Sem `key` aqui: remontar o input tiraria o foco de quem digita. */}
      <div className={`relative ${erro ? "animate-balanca" : ""}`}>
        <input
          id={id}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descritoPor}
          className={`h-[52px] w-full rounded-[14px] border bg-white px-4 text-base font-medium text-tinta transition placeholder:font-normal placeholder:text-musgo focus:outline-none disabled:bg-fio disabled:text-fumo ${
            erro
              ? "border-alerta shadow-[inset_0_0_0_1px_var(--color-alerta)]"
              : "border-linha focus:border-tinta focus:shadow-[inset_0_0_0_1px_var(--color-tinta)]"
          }`}
          style={folgaDireita ? { paddingRight: `${folgaDireita}px` } : undefined}
          {...resto}
        />
        {sufixo ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-fumo">
            {sufixo}
          </span>
        ) : null}
        {acessorio}
      </div>
      {ajuda ? (
        <p id={idAjuda} className="mt-2 text-[12.5px] leading-snug text-fumo">
          {ajuda}
        </p>
      ) : null}
      {erro ? (
        <p id={idMensagem} className="mt-2 animate-entra text-[12.5px] leading-snug font-medium text-alerta">
          {erro}
        </p>
      ) : aviso ? (
        <p id={idMensagem} className="mt-2 animate-entra text-[12.5px] leading-snug font-medium text-gema-texto">
          {aviso}
        </p>
      ) : null}
    </div>
  );
}

export function Segmento<T extends string>({
  label,
  opcoes,
  valor,
  onChange,
  ajuda,
  erro,
}: {
  label?: string;
  opcoes: { valor: T; rotulo: string }[];
  valor: T | null;
  onChange: (v: T) => void;
  ajuda?: string;
  erro?: string;
}) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const atual = opcoes.findIndex((o) => o.valor === valor);
  const focavel = atual === -1 ? 0 : atual;

  // Grupo de rádio: Tab entra e sai; as setas trocam a escolha (padrão do WAI-ARIA).
  function mover(evento: React.KeyboardEvent, indice: number) {
    const passo =
      evento.key === "ArrowRight" || evento.key === "ArrowDown" ? 1 : evento.key === "ArrowLeft" || evento.key === "ArrowUp" ? -1 : 0;
    if (passo === 0) return;
    evento.preventDefault();
    const proximo = (indice + passo + opcoes.length) % opcoes.length;
    onChange(opcoes[proximo].valor);
    botoes.current[proximo]?.focus();
  }

  return (
    <div>
      {label ? (
        <span className="mb-[7px] block text-[12.5px] font-semibold text-fumo">
          {label}
        </span>
      ) : null}
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {opcoes.map((o, i) => {
          const ativo = o.valor === valor;
          return (
            <button
              key={o.valor}
              ref={(el) => {
                botoes.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={ativo}
              tabIndex={i === focavel ? 0 : -1}
              onClick={() => onChange(o.valor)}
              onKeyDown={(e) => mover(e, i)}
              className={`flex h-11 flex-1 items-center justify-center rounded-xl border px-2 text-center text-sm transition active:scale-[0.97] ${
                ativo
                  ? "border-tinta bg-tinta font-semibold text-white"
                  : erro
                    ? "border-alerta bg-white font-medium text-tinta"
                    : "border-linha bg-white font-medium text-tinta hover:border-pedra"
              }`}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>
      {ajuda ? <p className="mt-2 text-[12.5px] leading-snug text-fumo">{ajuda}</p> : null}
      {erro ? <p className="mt-2 animate-entra text-[12.5px] leading-snug font-medium text-alerta">{erro}</p> : null}
    </div>
  );
}
