import Link from "next/link";

type Variante = "primaria" | "contorno" | "contorno-escuro" | "texto" | "destrutiva";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-[transform,filter,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-busy:opacity-100";

const variantes: Record<Variante, string> = {
  primaria:
    "bg-gema text-tinta shadow-[0_1px_2px_rgba(21,37,28,.08)] hover:-translate-y-px hover:brightness-[.97] hover:shadow-[0_8px_20px_-10px_rgba(21,37,28,.5)]",
  contorno: "border-[1.5px] border-tinta text-tinta hover:bg-tinta/5",
  "contorno-escuro":
    "border-[1.5px] border-grafite text-neve hover:border-musgo hover:bg-neve/10",
  texto: "text-mata hover:text-tinta",
  destrutiva:
    "bg-alerta text-white shadow-[0_1px_2px_rgba(126,39,31,.12)] hover:-translate-y-px hover:brightness-[.95] hover:shadow-[0_8px_20px_-10px_rgba(126,39,31,.55)]",
};

const tamanhos = {
  grande: "h-[54px] w-full px-6 text-base",
  media: "h-11 px-4 text-sm",
  pequena: "h-9 px-3.5 text-[13px]",
} as const;

/** Brilho que atravessa o botão principal quando o ponteiro passa por cima. */
const lustro = (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-100 from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
  />
);

interface Comum {
  variante?: Variante;
  tamanho?: keyof typeof tamanhos;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variante = "primaria",
  tamanho = "grande",
  carregando = false,
  rotuloCarregando,
  className = "",
  children,
  disabled,
  type = "button",
  ...resto
}: Comum & {
  carregando?: boolean;
  rotuloCarregando?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={`${base} ${variantes[variante]} ${tamanhos[tamanho]} ${className}`}
      {...resto}
    >
      {variante === "primaria" && !carregando ? lustro : null}
      <span className="relative flex items-center gap-2">
        {carregando ? (
          <>
            <span
              aria-hidden="true"
              className="size-4 animate-girar rounded-full border-2 border-current border-r-transparent"
            />
            {rotuloCarregando ?? children}
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}

export function ButtonLink({
  href,
  variante = "primaria",
  tamanho = "grande",
  className = "",
  children,
  ...resto
}: Comum & { href: string } & Omit<
    React.ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >) {
  return (
    <Link
      href={href}
      className={`${base} ${variantes[variante]} ${tamanhos[tamanho]} ${className}`}
      {...resto}
    >
      {variante === "primaria" ? lustro : null}
      <span className="relative flex items-center gap-2">{children}</span>
    </Link>
  );
}
