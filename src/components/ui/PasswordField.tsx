"use client";

import { useState } from "react";
import { Field } from "./Field";

type Props = Omit<React.ComponentProps<typeof Field>, "type" | "sufixo" | "acessorio">;

/** Campo de senha com "Mostrar/Ocultar" (spec 08 — PasswordField). */
export function PasswordField(props: Props) {
  const [visivel, setVisivel] = useState(false);

  return (
    <Field
      {...props}
      type={visivel ? "text" : "password"}
      acessorio={
        <button
          type="button"
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          aria-controls={props.id}
          onClick={() => setVisivel((v) => !v)}
          disabled={props.disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[10px] px-2.5 py-1.5 text-[12.5px] font-semibold text-mata transition-colors hover:bg-mata-fraca disabled:opacity-50"
        >
          <span key={String(visivel)} className="inline-block animate-pop">
            {visivel ? "Ocultar" : "Mostrar"}
          </span>
        </button>
      }
    />
  );
}
