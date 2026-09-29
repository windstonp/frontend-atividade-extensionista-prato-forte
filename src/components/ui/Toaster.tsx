"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Toast } from "./Toast";

export interface AvisoToast {
  texto: string;
  acao?: { rotulo: string; onClick: () => void };
  segundos?: number;
}

const Contexto = createContext<(aviso: AvisoToast) => void>(() => {});

/** Um aviso por vez, no topo da coluna do app; sobrevive à troca de página. */
export function Toaster({ children }: { children: React.ReactNode }) {
  const [atual, setAtual] = useState<(AvisoToast & { id: number }) | null>(null);
  const mostrar = useCallback((aviso: AvisoToast) => setAtual({ ...aviso, id: Date.now() }), []);
  const fechar = useCallback(() => setAtual(null), []);

  return (
    <Contexto.Provider value={mostrar}>
      {children}
      {atual ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] mx-auto max-w-[430px] pt-4 area-segura-cima">
          <div className="pointer-events-auto">
            <Toast
              key={atual.id}
              texto={atual.texto}
              acao={atual.acao}
              segundos={atual.segundos}
              aoExpirar={fechar}
            />
          </div>
        </div>
      ) : null}
    </Contexto.Provider>
  );
}

export const useToast = () => useContext(Contexto);
