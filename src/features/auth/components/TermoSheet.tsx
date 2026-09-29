"use client";

import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { cascata } from "@/lib/motion";
import { TERMO_PARAGRAFOS, TERMO_VERSAO } from "../termo";

export function TermoSheet({ aberta, aoFechar }: { aberta: boolean; aoFechar: () => void }) {
  return (
    <Sheet aberta={aberta} aoFechar={aoFechar} titulo="Termo de uso dos seus dados" descricao={`Versão ${TERMO_VERSAO}`}>
      <div className="mt-4 flex flex-col gap-3 text-[14px] leading-relaxed text-tinta">
        {TERMO_PARAGRAFOS.map((paragrafo, i) => (
          <p key={i} className="animate-entra" style={cascata(i, 50, 120)}>
            {paragrafo}
          </p>
        ))}
      </div>
      <Button variante="contorno" className="mt-6" onClick={aoFechar}>
        Fechar
      </Button>
    </Sheet>
  );
}
