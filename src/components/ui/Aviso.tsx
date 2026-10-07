/** Aviso em linha (meta fora da faixa, refeição do Nutri com menos proteína, offline, permissão de avisos). */
const TONS = {
  gema: "bg-gema-fraca text-gema-texto",
  alerta: "bg-alerta-fraca text-alerta-texto",
  mata: "bg-mata-fraca text-mata-texto",
} as const;

const PONTO = { gema: "bg-gema", alerta: "bg-alerta", mata: "bg-mata" } as const;

export function Aviso({
  tom,
  titulo,
  icone,
  className = "",
  children,
}: {
  tom: keyof typeof TONS;
  titulo?: string;
  icone?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div role={tom === "alerta" ? "alert" : "status"} className={`flex animate-entra items-start gap-2.5 rounded-[14px] px-3.5 py-3 ${TONS[tom]} ${className}`}>
      {icone ?? <span aria-hidden="true" className={`mt-1.5 size-1.5 shrink-0 animate-respira rounded-full ${PONTO[tom]}`} />}
      <div className="min-w-0 flex-1">
        {titulo ? <p className="text-[14px] font-semibold">{titulo}</p> : null}
        {children ? <div className={`text-[13px] leading-snug ${titulo ? "mt-1" : ""}`}>{children}</div> : null}
      </div>
    </div>
  );
}
