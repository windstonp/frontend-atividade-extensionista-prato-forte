"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Sheet } from "@/components/ui/Sheet";
import { usePedirPlano } from "@/features/dia/hooks";
import { comoApiError } from "@/lib/api/errors";

/** RF18 — pede um plano novo com as respostas atuais; as refeições feitas hoje ficam (RN20). */
export function RefazerPlano() {
  const router = useRouter();
  const pedir = usePedirPlano();
  const [aberta, setAberta] = useState(false);

  async function refazer() {
    try {
      const id = await pedir.mutateAsync();
      router.push(`/onboarding/gerando?plano=${id}&voltar=${encodeURIComponent("/perfil")}`);
    } catch {
      // a mensagem aparece na folha
    }
  }

  return (
    <>
      <Button variante="contorno" className="mt-3.5 w-full animate-entra" onClick={() => setAberta(true)}>
        Refazer meu plano
      </Button>
      <Sheet
        aberta={aberta}
        aoFechar={() => {
          setAberta(false);
          pedir.reset();
        }}
        titulo="Refazer meu plano"
        descricao="Vamos montar um plano novo com suas respostas atuais. As refeições que você já marcou hoje ficam."
      >
        {pedir.isError ? <div className="mt-4"><FormError erro={comoApiError(pedir.error)} /></div> : null}
        <div className="mt-5 flex flex-col gap-2">
          <Button carregando={pedir.isPending} onClick={() => void refazer()}>
            Refazer
          </Button>
          <button type="button" onClick={() => setAberta(false)} className="flex h-12 items-center justify-center text-[14.5px] font-semibold text-fumo">
            Cancelar
          </button>
        </div>
      </Sheet>
    </>
  );
}
