import { Button, ButtonLink } from "./Button";

type Acao = { rotulo: string; href: string; onClick?: never } | { rotulo: string; onClick: () => void; href?: never };

/** Estado vazio com direção: o que falta e o que fazer (spec 08 §4). */
export function EmptyState({
  ilustracao,
  titulo,
  descricao,
  acao,
  tom = "claro",
  className = "",
}: {
  ilustracao?: React.ReactNode;
  titulo: string;
  descricao?: string;
  acao?: Acao;
  tom?: "claro" | "escuro";
  className?: string;
}) {
  const escuro = tom === "escuro";
  return (
    <section className={`animate-entra rounded-[20px] p-[18px] ${escuro ? "bg-tinta text-neve" : "bg-white"} ${className}`}>
      {ilustracao}
      <h2 className={`font-display text-xl leading-tight font-bold tracking-[-0.02em] ${ilustracao ? "mt-4" : ""}`}>{titulo}</h2>
      {descricao ? <p className={`mt-2 text-sm leading-normal ${escuro ? "text-salvia" : "text-fumo"}`}>{descricao}</p> : null}
      {acao ? (
        acao.href !== undefined ? (
          <ButtonLink href={acao.href} className="mt-4">
            {acao.rotulo}
          </ButtonLink>
        ) : (
          <Button className="mt-4" onClick={acao.onClick}>
            {acao.rotulo}
          </Button>
        )
      ) : null}
    </section>
  );
}
