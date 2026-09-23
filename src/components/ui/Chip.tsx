"use client";

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
