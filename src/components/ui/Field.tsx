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
