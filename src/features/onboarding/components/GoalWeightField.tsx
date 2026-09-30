"use client";

import { Field } from "@/components/ui/Field";
import type { Goal } from "@/lib/types";
import { type Medidas, METRICO } from "@/lib/units";
import { alturaValida, AVISO_META_FORA, faixaSaudavel, lerNumero, metaForaDaFaixa, pedeMeta } from "../regras";


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
  medidas: m = METRICO,
}: {
  objetivo: Goal | null;
  alturaCm: number | null;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  medidas?: Medidas;
}) {
  if (!pedeMeta(objetivo)) return null;

  const faixa = alturaValida(alturaCm) ? faixaSaudavel(alturaCm) : null;
  const meta = lerNumero(valor);
  const fora = alturaValida(alturaCm) && meta !== null && !Number.isNaN(meta) && metaForaDaFaixa(m.deExibido(meta), alturaCm);

  return (
    <Field
      id="meta"
      label="Meta de peso (opcional)"
      sufixo={m.unidadePeso}
      inputMode="decimal"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      ajuda={
        faixa && alturaCm
          ? `Para ${m.altura(alturaCm)}, a faixa saudável vai de ${m.numero(faixa.min)} a ${m.numero(faixa.max)} ${m.unidadePeso}.`
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
