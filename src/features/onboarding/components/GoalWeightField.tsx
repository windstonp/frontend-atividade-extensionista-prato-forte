"use client";

import { Field } from "@/components/ui/Field";
import type { Goal } from "@/lib/types";
import { alturaValida, AVISO_META_FORA, faixaSaudavel, lerNumero, metaForaDaFaixa, pedeMeta } from "../regras";

const umaCasa = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const metros = (cm: number) => `${(cm / 100).toFixed(2).replace(".", ",")} m`;

/** Meta de peso opcional (RN10): só em ganhar/perder; mostra a faixa saudável e avisa sem bloquear. */
export function GoalWeightField({
  objetivo,
  alturaCm,
  valor,
  onChange,
  erro,
  disabled,
  className,
  style,
}: {
  objetivo: Goal | null;
  alturaCm: number | null;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!pedeMeta(objetivo)) return null;

  const faixa = alturaValida(alturaCm) ? faixaSaudavel(alturaCm) : null;
  const meta = lerNumero(valor);
  const fora = alturaValida(alturaCm) && meta !== null && !Number.isNaN(meta) && metaForaDaFaixa(meta, alturaCm);

  return (
    <Field
      id="meta"
      label="Meta de peso (opcional)"
      sufixo="kg"
      inputMode="decimal"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      ajuda={
        faixa && alturaCm
          ? `Para ${metros(alturaCm)}, a faixa saudável vai de ${umaCasa(faixa.min)} a ${umaCasa(faixa.max)} kg.`
          : "Opcional. Se deixar vazio, sugerimos uma meta saudável para você."
      }
      erro={erro}
      aviso={fora ? AVISO_META_FORA : undefined}
      disabled={disabled}
      className={className}
      style={style}
    />
  );
}
