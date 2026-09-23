/**
 * Transição entre as telas do app. O template remonta a cada navegação,
 * então a animação de entrada toca sozinha.
 */
export default function Transicao({ children }: { children: React.ReactNode }) {
  return <div className="animate-entra">{children}</div>;
}
