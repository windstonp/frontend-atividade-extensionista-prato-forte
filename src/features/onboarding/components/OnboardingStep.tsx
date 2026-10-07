"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { IconeVoltar } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Skeleton } from "@/components/ui/Skeleton";
import { Steps } from "@/components/ui/Steps";
import type { ApiError } from "@/lib/api/errors";

/** Casca de uma etapa (spec 02 §4): progresso, título, conteúdo e o botão que salva. */
export function OnboardingStep({
  numero,
  total,
  titulo,
  descricao,
  voltarPara,
  aoVoltar,
  rotuloBotao = "Continuar",
  rotuloSalvando = "Salvando…",
  carregando = false,
  erroAoCarregar = null,
  salvando = false,
  erroAoSalvar = null,
  podeContinuar = true,
  aoContinuar,
  acimaDoBotao,
  children,
}: {
  numero: number;
  total: number;
  titulo: string;
  descricao: string;
  voltarPara: string | null;
  /** Sem URL para voltar (passos só no cliente, como o questionário): o botão chama isto. */
  aoVoltar?: () => void;
  rotuloBotao?: string;
  rotuloSalvando?: string;
  carregando?: boolean;
  erroAoCarregar?: { aoTentarDeNovo: () => void } | null;
  salvando?: boolean;
  erroAoSalvar?: ApiError | null;
  podeContinuar?: boolean;
  aoContinuar?: () => void;
  acimaDoBotao?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const bloqueado = carregando || erroAoCarregar !== null;

  // Foco no título ao trocar de etapa: o leitor de tela anuncia onde a pessoa está (DoD da spec 02).
  useEffect(() => {
    tituloRef.current?.focus({ preventScroll: true });
  }, []);

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!bloqueado && !salvando && podeContinuar) aoContinuar?.();
  }

  return (
    <Screen>
      <form noValidate onSubmit={enviar} className="flex flex-1 flex-col">
        <header className="shrink-0 px-6 pt-seguro-[22px]">
          <div className="flex h-10 items-center justify-between">
            {voltarPara ? (
              <Link
                href={voltarPara}
                aria-label="Voltar"
                className="-ml-2.5 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-tinta/5"
              >
                <IconeVoltar size={22} />
              </Link>
            ) : aoVoltar ? (
              <button
                type="button"
                onClick={aoVoltar}
                aria-label="Voltar"
                className="-ml-2.5 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-tinta/5"
              >
                <IconeVoltar size={22} />
              </button>
            ) : (
              <span />
            )}
            <span className="text-[12.5px] font-medium text-fumo">
              Etapa {numero} de {total}
            </span>
          </div>
          <Steps atual={numero} total={total} />
        </header>

        <main className="flex-1 px-6 pt-7 pb-4">
          <h1
            ref={tituloRef}
            tabIndex={-1}
            className="animate-entra font-display text-[28px] leading-tight font-bold tracking-[-0.025em] outline-none"
            style={{ animationDelay: "40ms" }}
          >
            {titulo}
          </h1>
          <p className="mt-2.5 animate-entra text-[14.5px] leading-normal text-fumo" style={{ animationDelay: "110ms" }}>
            {descricao}
          </p>
          <div className="mt-5">
            {erroAoCarregar ? (
              <ErrorState
                titulo="Não foi possível carregar suas respostas"
                descricao="Confira a internet e tente de novo."
                aoTentarDeNovo={erroAoCarregar.aoTentarDeNovo}
              />
            ) : carregando ? (
              <div role="status" aria-busy="true" aria-label="Carregando suas respostas" className="flex flex-col gap-2.5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-[72px]" atraso={i * 90} />
                ))}
              </div>
            ) : (
              // Quando as respostas chegam, o conteúdo entra sem pulo (o esqueleto tinha a mesma altura aproximada).
              <div className="animate-fade">{children}</div>
            )}
          </div>
        </main>

        <footer className="shrink-0 animate-entra px-6 pt-3.5 pb-seguro-7" style={{ animationDelay: "260ms" }}>
          {bloqueado ? null : acimaDoBotao}
          <FormError erro={erroAoSalvar} />
          <Button type="submit" carregando={salvando} rotuloCarregando={rotuloSalvando} disabled={bloqueado || !podeContinuar}>
            {rotuloBotao}
          </Button>
        </footer>
      </form>
    </Screen>
  );
}
