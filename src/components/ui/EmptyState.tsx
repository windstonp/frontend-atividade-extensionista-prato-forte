import Link from "next/link";

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
  const botao = "mt-4 inline-flex h-12 items-center justify-center rounded-full bg-gema px-6 text-[15px] font-semibold text-tinta transition-transform active:scale-[0.97]";
  return (
    <section className={`animate-entra rounded-[20px] p-[18px] ${escuro ? "bg-tinta text-neve" : "bg-white"} ${className}`}>
      {ilustracao}
      <h2 className={`font-display text-xl leading-tight font-bold tracking-[-0.02em] ${ilustracao ? "mt-4" : ""}`}>{titulo}</h2>
      {descricao ? <p className={`mt-2 text-sm leading-normal ${escuro ? "text-salvia" : "text-fumo"}`}>{descricao}</p> : null}
      {acao ? (
        acao.href !== undefined ? (
          <Link href={acao.href} className={botao}>
            {acao.rotulo}
          </Link>
        ) : (
          <button type="button" onClick={acao.onClick} className={botao}>
            {acao.rotulo}
          </button>
        )
      ) : null}
    </section>
  );
}
