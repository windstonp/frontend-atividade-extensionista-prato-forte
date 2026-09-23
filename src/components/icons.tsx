/** Ícones do app: traço de 1.7, pontas redondas, grade de 24. */

type Props = {
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

function Base({
  size = 22,
  className,
  strokeWidth = 1.7,
  style,
  children,
}: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconePrato = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const IconeTalher = (p: Props) => (
  <Base {...p}>
    <path d="M6.5 3v5.2a2.6 2.6 0 0 0 5.2 0V3" />
    <path d="M9.1 8.2V21" />
    <path d="M17.6 3c-1.4 1.3-2.1 3.3-2.1 5.5s.8 3.4 2.1 3.4 2.1-1.2 2.1-3.4S19 4.3 17.6 3z" />
    <path d="M17.6 11.9V21" />
  </Base>
);

export const IconeEvolucao = (p: Props) => (
  <Base {...p}>
    <path d="M3.5 17.5l5-5.2 3.6 2.8 6-7.1" />
    <path d="M14.4 8.2h4v4" />
    <path d="M3.5 21h17" />
  </Base>
);

export const IconePessoa = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4.1" />
    <path d="M4.4 20.4c1.5-3.9 4.6-5.7 7.6-5.7s6.1 1.8 7.6 5.7" />
  </Base>
);

export const IconeVoltar = (p: Props) => (
  <Base strokeWidth={1.8} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Base>
);

export const IconeAvancar = (p: Props) => (
  <Base strokeWidth={1.9} {...p}>
    <path d="M9 5l7 7-7 7" />
  </Base>
);

export const IconeCheck = (p: Props) => (
  <Base strokeWidth={2.2} {...p}>
    <path d="M5 12.5l4.6 4.6L19 7.3" />
  </Base>
);

export const IconeMais = (p: Props) => (
  <Base strokeWidth={2} {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Base>
);

export const IconeMenos = (p: Props) => (
  <Base strokeWidth={2} {...p}>
    <path d="M5 12h14" />
  </Base>
);

export const IconeRecomecar = (p: Props) => (
  <Base strokeWidth={1.9} {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6" />
    <path d="M20 12a8 8 0 0 1-13.7 5.6" />
    <path d="M17.5 3v3.6h-3.6" />
    <path d="M6.5 21v-3.6h3.6" />
  </Base>
);

export const IconeEnviar = (p: Props) => (
  <Base strokeWidth={2} {...p}>
    <path d="M12 19.5V5.5" />
    <path d="M5.5 12L12 5.5 18.5 12" />
  </Base>
);

export const IconeSeta = (p: Props) => (
  <Base strokeWidth={1.8} {...p}>
    <path d="M4 12h15" />
    <path d="M13.5 6.5L20 12l-6.5 5.5" />
  </Base>
);

export const IconeAjustes = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 14.6a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-3-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9h-.2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2v-.2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 3 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1.1z" />
  </Base>
);

export const IconeSemConexao = (p: Props) => (
  <Base strokeWidth={1.9} {...p}>
    <path d="M3 4l18 16" />
    <path d="M5.5 10.8a11 11 0 0 1 4.2-2.4" />
    <path d="M1.8 7.4A16 16 0 0 1 7 4.3" />
    <path d="M14.4 8.6a11 11 0 0 1 4.1 2.2" />
    <path d="M17.2 5.1A16 16 0 0 1 22.2 7.4" />
    <path d="M9 14.6a6 6 0 0 1 5.6-.6" />
    <path d="M12 19.2h.01" />
  </Base>
);

/** A marca do Nutri: uma gema. Nada de faísca de IA. */
export function MarcaNutri({
  size = 24,
  apagada = false,
}: {
  size?: number;
  apagada?: boolean;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${
        apagada ? "bg-linha" : "bg-gema"
      }`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className={`block rounded-full ${apagada ? "bg-musgo" : "bg-tinta"}`}
        style={{ width: size * 0.34, height: size * 0.34 }}
      />
    </span>
  );
}
