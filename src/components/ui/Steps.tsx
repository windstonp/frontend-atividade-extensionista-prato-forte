"use client";

/** Régua de etapas: o trecho atual enche da esquerda para a direita. */
export function Steps({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="mt-3 flex gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const feito = n < atual;
        const agora = n === atual;
        return (
          <span
            key={n}
            className={`relative h-1 flex-1 overflow-hidden rounded-full transition-colors duration-400 ${
              feito ? "bg-tinta" : "bg-[#cfd6cc]"
            }`}
          >
            {agora ? (
              <span className="absolute inset-0 origin-left animate-tique rounded-full bg-gema" />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
