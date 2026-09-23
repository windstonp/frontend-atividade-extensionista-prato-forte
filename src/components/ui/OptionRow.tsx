"use client";

export function OptionRow({
  marcado,
  onClick,
  titulo,
  descricao,
  etiqueta,
  quadrado = false,
  compacto = false,
  className = "",
  style,
}: {
  marcado: boolean;
  onClick: () => void;
  titulo: string;
  descricao?: string;
  etiqueta?: React.ReactNode;
  quadrado?: boolean;
  compacto?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      role={quadrado ? "checkbox" : "radio"}
      aria-checked={marcado}
      onClick={onClick}
      style={style}
      className={`flex w-full items-start gap-3 rounded-2xl border bg-white px-4 text-left transition-[border-color,box-shadow,transform] duration-250 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[0.99] ${
        compacto ? "min-h-14 items-center py-3" : "py-[15px]"
      } ${
        marcado
          ? "border-tinta shadow-[inset_0_0_0_1px_var(--color-tinta),0_8px_22px_-16px_rgba(21,37,28,.9)]"
          : "border-linha hover:-translate-y-px hover:border-pedra"
      } ${className}`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center border-[1.5px] transition-[background-color,border-color,transform] duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] ${
          quadrado ? "rounded-md" : "rounded-full"
        } ${marcado ? "scale-110 border-tinta bg-tinta" : "border-[#c3ccc0]"} ${
          compacto ? "mt-0" : "mt-0.5"
        }`}
      >
        <span
          className={`block bg-gema transition-transform duration-250 ease-[cubic-bezier(.34,1.56,.64,1)] ${
            quadrado ? "size-[9px] rounded-[2px]" : "size-2 rounded-full"
          } ${marcado ? "scale-100" : "scale-0"}`}
        />
      </span>
      <span className="flex-1">
        <span className="block text-base font-semibold tracking-[-0.01em]">{titulo}</span>
        {descricao ? (
          <span className="mt-0.5 block text-[13.5px] leading-snug text-fumo">
            {descricao}
          </span>
        ) : null}
      </span>
      {etiqueta}
    </button>
  );
}

export function EtiquetaAlergia() {
  return (
    <span className="animate-pop rounded-full bg-alerta-fraca px-2 py-[3px] text-[11px] font-semibold text-alerta">
      Alergia
    </span>
  );
}
