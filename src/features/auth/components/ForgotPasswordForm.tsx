"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { IconeCheck } from "@/components/icons";
import { type ApiError, comoApiError } from "@/lib/api/errors";
import { erroEmail } from "../schemas";

/** N03 — pede o link; a confirmação é a mesma exista ou não a conta (RN04). */
export function ForgotPasswordForm({ aoEnviar }: { aoEnviar: (email: string) => Promise<unknown> }) {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [erroGeral, setErroGeral] = useState<ApiError | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (enviando) return;
    const problema = erroEmail(email);
    setErro(problema);
    setErroGeral(null);
    if (problema) return;

    setEnviando(true);
    try {
      await aoEnviar(email.trim());
      setEnviado(true);
    } catch (e) {
      setErroGeral(comoApiError(e));
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="animate-escala rounded-3xl bg-white p-6 text-center">
          {/* O halo continua pulsando: o próximo passo acontece na caixa de entrada. */}
          <span className="relative mx-auto flex size-12 items-center justify-center">
            <span aria-hidden="true" className="absolute inset-0 animate-halo rounded-full bg-mata/35" />
            <span className="relative flex size-12 animate-pop items-center justify-center rounded-full bg-mata text-white">
              <IconeCheck size={22} strokeWidth={2.4} />
            </span>
          </span>
          <h2 className="mt-4 font-display text-[22px] font-bold tracking-[-0.02em]">Confira seu e-mail</h2>
          <p className="mt-2 text-[14px] leading-normal text-fumo">
            Se houver uma conta com <span className="font-semibold text-tinta [overflow-wrap:anywhere]">{email.trim()}</span>, o link chega em alguns minutos. Olhe também a caixa de spam.
          </p>
        </div>
        <div className="mt-auto pt-8">
          <ButtonLink href="/entrar" variante="contorno">
            Voltar para entrar
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={enviar} className="flex flex-1 flex-col">
      <Field
        id="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErro(undefined);
        }}
        erro={erro}
        disabled={enviando}
        className="animate-entra"
        style={{ animationDelay: "160ms" }}
      />
      <div className="mt-auto animate-entra pt-8" style={{ animationDelay: "220ms" }}>
        <FormError erro={erroGeral} />
        <Button type="submit" carregando={enviando} rotuloCarregando="Enviando…">
          Enviar link
        </Button>
      </div>
    </form>
  );
}
