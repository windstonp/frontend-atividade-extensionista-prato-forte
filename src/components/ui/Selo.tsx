/** Selo curto de estado ("Trocado", "Refeição feita", "Próxima refeição", "Alergia", "meta sugerida"). */
const TONS = {
  mata: "bg-mata-fraca text-mata-texto",
  gema: "bg-gema-fraca text-gema-texto",
  alerta: "bg-alerta-fraca text-alerta",
  neutro: "bg-papel text-fumo",
} as const;

const PONTO = { mata: "bg-mata", gema: "bg-gema", alerta: "bg-alerta", neutro: "bg-pedra" } as const;

export function Selo({
  tom,
  icone,
  pulsante = false,
  className = "",
  children,
}: {
  tom: keyof typeof TONS;
  icone?: React.ReactNode;
  /** Ponto que respira (ex.: "Próxima refeição"). */
  pulsante?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex h-[24px] shrink-0 animate-pop items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-semibold ${TONS[tom]} ${className}`}>
      {pulsante ? <span data-ponto aria-hidden="true" className={`size-1.5 animate-respira rounded-full ${PONTO[tom]}`} /> : null}
      {icone}
      {children}
    </span>
  );
}
