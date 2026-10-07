"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import { comoApiError } from "@/lib/api/errors";
import { usePedirPlano, usePlano } from "../hooks";
import { PASSOS, PlanGenerating } from "./PlanGenerating";

/**
 * Só caminhos do próprio app: `/perfil` sim; `//site`, `/\\site`, `https://…` e caracteres de controle não
 * (o navegador trata `\\` como `/` e ignora tabs, virando um endereço externo).
 */
export function destinoSeguro(voltar: string | null): string | null {
  return voltar && /^\/[A-Za-z0-9\-_/?=&%.]*$/.test(voltar) && !voltar.startsWith("//") ? voltar : null;
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
    let novo: number;
    try {
      novo = await pedir.mutateAsync();
    } catch (erro) {
      avisar({ texto: comoApiError(erro).message });
      return;
    }
    router.replace(`/onboarding/gerando?plano=${novo}${voltar ? `&voltar=${encodeURIComponent(voltar)}` : ""}`);
  }

  return (
    <PlanGenerating concluidos={concluido} falhou={falhou} tentando={pedir.isPending} aoTentarDeNovo={() => void tentarDeNovo()} />
  );
}
