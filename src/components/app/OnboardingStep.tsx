import Link from "next/link";
import { IconeVoltar } from "@/components/icons";
import { Screen } from "@/components/app/Screen";
import { ButtonLink } from "@/components/ui/Button";
import { Steps } from "@/components/ui/Steps";
import { TOTAL_ETAPAS } from "@/lib/onboarding-store";

export function OnboardingStep({
  etapa,
  voltarPara,
  titulo,
  descricao,
  proximo,
  rotuloProximo = "Continuar",
  acimaDoBotao,
  children,
}: {
  etapa: number;
  voltarPara: string;
  titulo: string;
  descricao: string;
  proximo: string;
  rotuloProximo?: string;
  acimaDoBotao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Screen>
      <header className="shrink-0 px-6 pt-[22px] area-segura-cima">
        <div className="flex h-10 items-center justify-between">
          <Link
            href={voltarPara}
            aria-label="Voltar"
            className="-ml-2.5 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-tinta/5"
          >
            <IconeVoltar size={22} />
          </Link>
          <span className="text-[12.5px] font-medium text-fumo">
            Etapa {etapa} de {TOTAL_ETAPAS}
          </span>
        </div>
        <Steps atual={etapa} total={TOTAL_ETAPAS} />
      </header>

      <main className="flex-1 px-6 pt-7 pb-4">
        <h1
          className="animate-entra font-display text-[28px] leading-tight font-bold tracking-[-0.025em]"
          style={{ animationDelay: "40ms" }}
        >
          {titulo}
        </h1>
        <p
          className="mt-2.5 animate-entra text-[14.5px] leading-normal text-fumo"
          style={{ animationDelay: "110ms" }}
        >
          {descricao}
        </p>
        <div className="mt-5">{children}</div>
      </main>

      <footer
        className="shrink-0 animate-entra px-6 pt-3.5 pb-7 area-segura-baixo"
        style={{ animationDelay: "260ms" }}
      >
        {acimaDoBotao}
        <ButtonLink href={proximo}>{rotuloProximo}</ButtonLink>
      </footer>
    </Screen>
  );
}
