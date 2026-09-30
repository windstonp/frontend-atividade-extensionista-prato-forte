import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** Hoje/Dieta sem plano ativo (409 `NO_ACTIVE_PLAN`): o plano está gerando ou a última geração falhou. */
export function NoPlanState({
  estado,
  planId,
  aoTentarDeNovo,
  tentando = false,
}: {
  estado: "gerando" | "falhou";
  planId: number | null;
  aoTentarDeNovo: () => void;
  tentando?: boolean;
}) {
  const gerando = estado === "gerando";
  return (
    <section className="animate-escala rounded-3xl bg-tinta px-6 py-7 text-neve">
      <span className="relative mb-5 block size-10">
        <span className={`absolute inset-0 rounded-full ${gerando ? "animate-halo bg-gema/60" : "bg-alerta/30"}`} />
        <span className={`absolute inset-2.5 rounded-full ${gerando ? "animate-respira bg-gema" : "bg-alerta"}`} />
      </span>
      <h2 className="animate-entra font-display text-[24px] leading-tight font-bold tracking-[-0.025em]">
        {gerando ? "Seu plano está quase pronto" : "Não conseguimos montar seu plano"}
      </h2>
      <p className="mt-2 animate-entra text-[14px] leading-normal text-musgo" style={{ animationDelay: "80ms" }}>
        {gerando
          ? "O Nutri está terminando de encaixar as refeições nos seus horários."
          : "Seus dados estão salvos. Foi a conexão com o Nutri que falhou no meio do caminho."}
      </p>
      <div className="mt-5 animate-entra" style={{ animationDelay: "160ms" }}>
        {gerando && planId !== null ? (
          <Link
            href={`/onboarding/gerando?plano=${planId}&voltar=${encodeURIComponent("/hoje")}`}
            className="inline-flex h-11 items-center rounded-full bg-gema px-5 text-sm font-semibold text-tinta transition-transform duration-200 active:scale-95"
          >
            Acompanhar
          </Link>
        ) : (
          <Button variante="contorno-escuro" carregando={tentando} onClick={aoTentarDeNovo}>
            Tentar de novo
          </Button>
        )}
      </div>
    </section>
  );
}
