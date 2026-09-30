"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconeCheck, MarcaNutri } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { usePedirPlano, usePlano } from "../hooks";

const PASSOS = [
  "Lendo seu perfil",
  "Calculando calorias e proteína",
  "Escolhendo alimentos da sua lista",
  "Encaixando nos seus horários",
  "Conferindo suas restrições",
];

/** Só caminhos do próprio app: `/perfil` sim, `//site` e `https://…` não. */
export function destinoSeguro(voltar: string | null): string | null {
  return voltar && voltar.startsWith("/") && !voltar.startsWith("//") ? voltar : null;
}

/** S09 — acompanha a geração (polling de 1,5 s em `usePlano`). */
export function GerandoTela() {
  const busca = useSearchParams();
  const router = useRouter();
  const id = Number(busca.get("plano")) || null;
  const voltar = destinoSeguro(busca.get("voltar"));

  useEffect(() => {
    if (id === null) router.replace("/hoje");
  }, [id, router]);

  if (id === null) return null;
  return <Acompanhamento key={id} id={id} voltar={voltar} />;
}

function Acompanhamento({ id, voltar }: { id: number; voltar: string | null }) {
  const router = useRouter();
  const avisar = useToast();
  const plano = usePlano(id);
  const pedir = usePedirPlano();
  const [passo, setPasso] = useState(0);
  const status = plano.data?.status;
  const falhou = status === "failed" || plano.isError;

  // Os passos andam por tempo até o último, que só conclui com o plano pronto.
  useEffect(() => {
    const relogio = setInterval(() => setPasso((p) => Math.min(p + 1, PASSOS.length - 1)), 520);
    return () => clearInterval(relogio);
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    const vai = setTimeout(() => {
      if (voltar) {
        avisar({ texto: "Seu plano novo está pronto." });
        router.replace(voltar);
      } else {
        router.replace(`/onboarding/pronto?plano=${id}`);
      }
    }, 350);
    return () => clearTimeout(vai);
  }, [status, voltar, id, router, avisar]);

  const concluido = status === "ready" ? PASSOS.length : passo;

  async function tentarDeNovo() {
    const novo = await pedir.mutateAsync();
    router.replace(`/onboarding/gerando?plano=${novo}${voltar ? `&voltar=${encodeURIComponent(voltar)}` : ""}`);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-between bg-tinta px-8 pt-13 pb-10 text-neve area-segura-cima area-segura-baixo">
      <div className="flex items-center gap-2.5">
        <MarcaNutri size={18} />
        <span className="font-display text-[17px] font-bold tracking-[-0.015em]">Prato Forte</span>
      </div>

      {falhou ? (
        <div>
          <h1 className="animate-balanca font-display text-[32px] leading-tight font-bold tracking-[-0.03em]">Não deu para montar agora</h1>
          <p className="mt-3 max-w-[280px] text-[14.5px] leading-normal text-musgo">
            Seus dados estão salvos. Foi a conexão com o Nutri que falhou no meio do caminho.
          </p>
          <Button variante="contorno-escuro" className="mt-6" carregando={pedir.isPending} onClick={() => void tentarDeNovo()}>
            Tentar de novo
          </Button>
        </div>
      ) : (
        <div>
          <div className="relative mb-8 size-14">
            <span className="absolute inset-0 rounded-full border-[1.5px] border-gema motion-safe:animate-[pulso_2.6s_cubic-bezier(.2,.6,.3,1)_infinite]" />
            <span className="absolute inset-0 rounded-full border-[1.5px] border-gema [animation-delay:1.3s] motion-safe:animate-[pulso_2.6s_cubic-bezier(.2,.6,.3,1)_infinite]" />
            <span className="absolute inset-3.5 rounded-full bg-gema" />
          </div>

          <h1 className="animate-entra font-display text-[32px] leading-tight font-bold tracking-[-0.03em]">Montando seu plano</h1>
          <p className="mt-3 max-w-[280px] text-[14.5px] leading-normal text-musgo">
            Estamos cruzando seus dados com os alimentos que você marcou.
          </p>

          <ul className="mt-7 flex list-none flex-col gap-4" aria-live="polite">
            {PASSOS.map((texto, i) => {
              const feito = i < concluido;
              const atual = i === concluido;
              return (
                <li key={texto} className="flex animate-entra-lado-esq items-center gap-3" style={{ animationDelay: `${160 + i * 90}ms` }}>
                  {feito ? (
                    <span className="flex size-5 shrink-0 animate-pop items-center justify-center rounded-full bg-mata text-white">
                      <IconeCheck size={11} strokeWidth={2.4} />
                    </span>
                  ) : atual ? (
                    <span className="relative flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gema">
                      <span className="absolute inset-0 animate-halo rounded-full bg-gema/50" />
                      <span className="size-[7px] animate-respira rounded-full bg-gema" />
                    </span>
                  ) : (
                    <span className="size-5 shrink-0 rounded-full border-[1.5px] border-grafite" />
                  )}
                  <span
                    className={`text-[14.5px] transition-colors duration-400 ${
                      feito ? "text-salvia" : atual ? "font-semibold text-neve" : "text-cinza-treino"
                    }`}
                  >
                    {texto}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <div className="relative h-1 overflow-hidden rounded-full bg-breu">
          <span
            className="block h-full rounded-full bg-gema transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{ width: `${Math.min(100, (concluido / PASSOS.length) * 100)}%` }}
          />
          <span className="brilho absolute inset-0 block opacity-40" />
        </div>
        <p className="mt-3 text-[12.5px] text-[#8d998f]">Costuma levar uns 10 segundos.</p>
      </div>

      <style>{`@keyframes pulso { 0% { transform: scale(1); opacity: .5 } 80%, 100% { transform: scale(2.6); opacity: 0 } }`}</style>
    </div>
  );
}
