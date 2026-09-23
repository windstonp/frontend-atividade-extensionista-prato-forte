export function Field({
  id,
  label,
  sufixo,
  ajuda,
  className = "",
  style,
  ...resto
}: {
  id: string;
  label: string;
  sufixo?: string;
  ajuda?: string;
  style?: React.CSSProperties;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "style">) {
  return (
    <div className={className} style={style}>
      <label
        htmlFor={id}
        className="mb-[7px] block text-[12.5px] font-semibold text-fumo"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="h-[52px] w-full rounded-[14px] border border-linha bg-white px-4 text-base font-medium text-tinta transition placeholder:font-normal placeholder:text-musgo focus:border-tinta focus:shadow-[inset_0_0_0_1px_var(--color-tinta)] focus:outline-none disabled:bg-fio disabled:text-fumo"
          style={sufixo ? { paddingRight: `${sufixo.length * 9 + 22}px` } : undefined}
          {...resto}
        />
        {sufixo ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-fumo">
            {sufixo}
          </span>
        ) : null}
      </div>
      {ajuda ? <p className="mt-2 text-[12.5px] leading-snug text-fumo">{ajuda}</p> : null}
    </div>
  );
}

export function Segmento<T extends string>({
  label,
  opcoes,
  valor,
  onChange,
  ajuda,
}: {
  label?: string;
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  onChange: (v: T) => void;
  ajuda?: string;
}) {
  return (
    <div>
      {label ? (
        <span className="mb-[7px] block text-[12.5px] font-semibold text-fumo">
          {label}
        </span>
      ) : null}
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {opcoes.map((o) => {
          const ativo = o.valor === valor;
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={ativo}
              onClick={() => onChange(o.valor)}
              className={`flex h-11 flex-1 items-center justify-center rounded-xl border px-2 text-center text-sm transition ${
                ativo
                  ? "border-tinta bg-tinta font-semibold text-white"
                  : "border-linha bg-white font-medium text-tinta hover:border-pedra"
              }`}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>
      {ajuda ? <p className="mt-2 text-[12.5px] leading-snug text-fumo">{ajuda}</p> : null}
    </div>
  );
}
