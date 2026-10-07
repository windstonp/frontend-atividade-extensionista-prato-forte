import { EmptyState } from "@/components/ui/EmptyState";

/** Sem pesagens no período (spec 05 §4 S15). */
export function EvolucaoVazia() {
  return (
    <EmptyState
      ilustracao={
        <svg viewBox="0 0 300 120" width="100%" height={120} role="img" aria-label="Gráfico ainda sem pesagens registradas" className="block">
          <line x1="0" y1="14" x2="300" y2="14" stroke="var(--color-linha)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="0" y="10" fontSize="10" fill="var(--color-musgo)">
            sua meta
          </text>
          <line x1="10" y1="96" x2="290" y2="96" stroke="var(--color-linha)" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
          <circle cx="10" cy="96" r="5.5" fill="#ffffff" stroke="var(--color-pedra)" strokeWidth="2" className="animate-respira" />
        </svg>
      }
      titulo="Sua linha começa na primeira pesagem"
      descricao="Registre o peso hoje e repita uma vez por semana. Em um mês já dá para ver para onde a linha está indo."
      acao={{ rotulo: "Registrar meu peso", href: "/evolucao/peso" }}
    />
  );
}
