"use client";

import { IconeMais } from "@/components/icons";

export function Chip({
  marcado,
  onClick,
  children,
  className = "",
  style,
}: {
  marcado: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      aria-pressed={marcado}
      onClick={onClick}
      style={style}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(.22,1,.36,1)] active:scale-95 ${
        marcado
          ? "border-tinta bg-tinta text-white shadow-[0_6px_16px_-10px_rgba(21,37,28,.8)]"
          : "border-linha bg-white text-tinta hover:-translate-y-px hover:border-pedra"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`block rounded-full bg-gema transition-[width,opacity,margin] duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] ${
          marcado ? "-ml-0.5 h-1.5 w-1.5 opacity-100" : "-mr-2 h-1.5 w-0 opacity-0"
        }`}
      />
      {children}
    </button>
  );
}

/** Item digitado pela pessoa (ex.: "outras restrições"), com botão para tirar da lista. */
export function ChipRemovivel({
  children,
  aoRemover,
  className = "",
  style,
}: {
  children: string;
  aoRemover: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={style}
      className={`inline-flex min-h-11 items-center gap-1 rounded-full border border-tinta bg-tinta pr-1.5 pl-4 text-sm font-medium text-white ${className}`}
    >
      {children}
      <button
        type="button"
        aria-label={`Remover ${children}`}
        onClick={aoRemover}
        className="flex size-8 items-center justify-center rounded-full transition-[background-color,transform] duration-200 hover:bg-white/15 active:scale-90"
      >
        <IconeMais size={16} className="rotate-45" />
      </button>
    </span>
  );
}
