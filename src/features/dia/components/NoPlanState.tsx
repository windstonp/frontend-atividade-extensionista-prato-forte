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
      {/* as cinco refeições do dia, como na linha do Hoje: acendem em sequência enquanto o plano é montado */}
      <div aria-hidden className="relative mb-6 flex w-[132px] items-center justify-between">
        <span className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-breu" />
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`relative block size-3 animate-pop rounded-full ${
              gerando ? "bg-gema" : i === 4 ? "bg-alerta" : "bg-grafite"
            }`}
            style={{ animationDelay: `${120 + i * 70}ms` }}
          >
            {gerando ? (
              <span
                className="absolute inset-0 block animate-respira rounded-full bg-tinta"
                style={{ animationDelay: `${i * 360}ms` }}
              />
            ) : null}
          </span>
        ))}
      </div>
      <h2 className={`${gerando ? "animate-entra" : "animate-balanca"} font-display text-[24px] leading-tight font-bold tracking-[-0.025em]`}>
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
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-gema px-5 text-sm font-semibold text-tinta transition-[transform,filter] duration-200 hover:brightness-[.97] focus-visible:outline-gema active:scale-95"
          >
            Acompanhar
          </Link>
        ) : (
          <Button variante="contorno-escuro" className="focus-visible:outline-gema" carregando={tentando} onClick={aoTentarDeNovo}>
            Tentar de novo
          </Button>
        )}
      </div>
    </section>
  );
}
