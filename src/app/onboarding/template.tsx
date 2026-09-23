/** No onboarding a tela entra pela direita, como quem avança uma etapa. */
export default function TransicaoOnboarding({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-entra-lado">{children}</div>;
}
