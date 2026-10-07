"use client";

import { cascata } from "@/lib/motion";
import type { CamposRotina } from "../regras";

const HORARIOS = [
  { id: "acorda", rotulo: "Acorda às", campo: "wakeTime" },
  { id: "treina", rotulo: "Treina às", campo: "trainingTime" },
  { id: "dorme", rotulo: "Dorme às", campo: "sleepTime" },
] as const;

export type Horas = Pick<CamposRotina, "wakeTime" | "trainingTime" | "sleepTime">;

/** Horários de acordar, treinar e dormir, com a mensagem de erro de cada um. */
export function RoutineTimes({
  horas,
  erros,
  aoMudar,
}: {
  horas: Horas;
  erros: Partial<Record<keyof Horas, string>>;
  aoMudar: (campo: keyof Horas, valor: string) => void;
}) {
  return (
    <div className="rounded-[18px] bg-white px-4">
      {HORARIOS.map(({ id, rotulo, campo }, i) => {
        const mensagem = erros[campo];
        return (
          <div
            key={id}
            style={cascata(i, 70, 180)}
            className={`animate-entra py-2 ${i < HORARIOS.length - 1 ? "border-b border-fio" : ""}`}
          >
            <div className="flex min-h-12 items-center justify-between">
              <label htmlFor={id} className="text-[15px] font-medium">
                {rotulo}
              </label>
              <input
                id={id}
                type="time"
                value={horas[campo]}
                aria-invalid={mensagem ? true : undefined}
                aria-describedby={mensagem ? `${id}-mensagem` : undefined}
                onChange={(e) => aoMudar(campo, e.target.value)}
                className={`h-12 w-[110px] rounded-xl border bg-white text-center font-display text-[19px] font-semibold tracking-[-0.01em] focus:outline-none ${
                  mensagem ? "border-alerta" : "border-linha focus:border-tinta focus:shadow-[inset_0_0_0_1px_var(--color-tinta)]"
                }`}
              />
            </div>
            {mensagem ? (
              <p id={`${id}-mensagem`} className="mb-1 animate-entra text-[12.5px] leading-snug font-medium text-alerta">
                {mensagem}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
