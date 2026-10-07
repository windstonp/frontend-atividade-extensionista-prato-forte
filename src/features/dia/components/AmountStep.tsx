"use client";

import { useId, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { lerQuantidade, previa } from "../registro";
import type { Medida, Totais } from "../tipos";

const numero = (n: number) => (Number.isInteger(n) ? String(n) : String(n).replace(".", ","));

/** Passo "Quanto você comeu?" — número grande em g/ml, atalhos e prévia ao vivo (RF33/RF34). */
export function AmountStep({ nome, medida, per100, atalhos, conflitos, inicial, modo, salvando, aoConfirmar, aoRemover, aoVoltar, aoEditarAlimento }: {
  nome: string; medida: Medida; per100: Totais; atalhos: { rotulo: string; amount: number }[]; conflitos: string[];
  inicial?: number; modo: "adicionar" | "editar"; salvando: boolean;
  aoConfirmar: (amount: number) => void; aoRemover?: () => void; aoVoltar?: () => void; aoEditarAlimento?: () => void;
}) {
  const id = useId();
  const [texto, setTexto] = useState(inicial !== undefined ? numero(inicial) : "");
  const quantidade = lerQuantidade(texto);
  const p = previa(per100, quantidade ?? 0);
  const invalido = texto.trim() !== "" && quantidade === null;

  return (
    <div>
      <h3 className="font-display text-[22px] font-bold tracking-[-0.02em]">Quanto você comeu?</h3>
      <p className="mt-0.5 text-[13.5px] text-fumo">{nome}</p>
      {conflitos.length > 0 ? (
        <Aviso tom="alerta" className="mt-3">Este alimento tem {conflitos.join(", ").toLowerCase()}, que está nas suas restrições.</Aviso>
      ) : null}

      <label htmlFor={id} className="sr-only">Quantidade</label>
      <div className="mt-4 flex items-baseline gap-2 border-b-2 border-tinta pb-1 focus-within:border-mata">
        <input id={id} inputMode="decimal" autoComplete="off" value={texto} onChange={(e) => setTexto(e.target.value)}
          aria-invalid={invalido || undefined} aria-describedby={invalido ? `${id}-erro` : undefined}
          className="w-full bg-transparent font-display text-[44px] leading-none font-bold tracking-[-0.03em] outline-none" placeholder="0" />
        <span className="font-display text-xl font-semibold text-fumo">{medida}</span>
      </div>
      {invalido ? <p id={`${id}-erro`} className="mt-1.5 text-[12.5px] font-medium text-alerta">Use um número entre 0,1 e 2000, com até uma casa.</p> : null}

      {atalhos.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {atalhos.map((a) => (
            <Chip key={a.amount} marcado={quantidade === a.amount} onClick={() => setTexto(numero(a.amount))}>{a.rotulo}</Chip>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-[13.5px] text-fumo" aria-live="polite">
        <span className="font-semibold text-tinta">{p.calories} kcal</span> · {numero(p.protein)} g de proteína · {numero(p.carbs)} g de carboidrato · {numero(p.fat)} g de gordura
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        <Button tamanho="grande" disabled={quantidade === null} carregando={salvando} onClick={() => quantidade !== null && aoConfirmar(quantidade)}>
          {modo === "adicionar" ? "Adicionar" : "Salvar"}
        </Button>
        {aoRemover ? <Button variante="destrutiva" tamanho="grande" onClick={aoRemover}>Remover</Button> : null}
        {aoEditarAlimento ? <Button variante="texto" onClick={aoEditarAlimento}>Editar alimento</Button> : null}
        {aoVoltar ? <Button variante="texto" onClick={aoVoltar}>Voltar para a busca</Button> : null}
      </div>
    </div>
  );
}
