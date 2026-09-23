export function Skeleton({
  className = "",
  atraso = 0,
}: {
  className?: string;
  atraso?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-linha/70 ${className}`}
      style={{ animationDelay: `${atraso}ms` }}
      aria-hidden="true"
    >
      <span className="brilho absolute inset-0 block" style={{ animationDelay: `${atraso}ms` }} />
    </div>
  );
}

/** Esqueleto da Hoje, com a mesma silhueta do conteúdo real. */
export function EsqueletoDoDia() {
  return (
    <div className="animate-fade px-5" aria-busy="true" aria-label="Carregando seu dia">
      <Skeleton className="h-[92px]" />
      <Skeleton className="mt-4 h-[380px] rounded-3xl" atraso={90} />
      <Skeleton className="mt-4 h-[120px]" atraso={180} />
    </div>
  );
}
