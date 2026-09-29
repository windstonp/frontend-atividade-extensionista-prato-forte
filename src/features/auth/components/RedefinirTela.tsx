"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { ApiError } from "@/lib/api/errors";
import { useResetPassword } from "../hooks";
import type { DadosNovaSenha } from "../schemas";
import { AuthScreen } from "./AuthScreen";
import { ResetPasswordForm } from "./ResetPasswordForm";

/** N04 — o link do e-mail traz `token` e `email`; sem eles (ou vencido), pede outro. */
export function RedefinirTela() {
  const busca = useSearchParams();
  const token = busca.get("token");
  const email = busca.get("email");
  const redefinir = useResetPassword();
  const router = useRouter();
  const avisar = useToast();
  const [linkInvalido, setLinkInvalido] = useState(!token || !email);

  if (linkInvalido || !token || !email) {
    return (
      <AuthScreen voltarPara="/entrar" rotuloVoltar="Voltar para entrar" titulo="Esse link não vale mais">
        <div className="animate-entra rounded-2xl bg-alerta-fraca px-4 py-3.5" style={{ animationDelay: "120ms" }}>
          <p className="text-[14px] leading-snug font-medium text-alerta-texto">Esse link expirou. Peça outro.</p>
        </div>
        <div className="mt-auto pt-8">
          <ButtonLink href="/senha/esqueci">Pedir outro link</ButtonLink>
        </div>
      </AuthScreen>
    );
  }

  async function salvar(dados: DadosNovaSenha) {
    try {
      await redefinir.mutateAsync({ token: token!, email: email!, ...dados });
    } catch (erro) {
      if (erro instanceof ApiError && erro.code === "INVALID_RESET_TOKEN") {
        setLinkInvalido(true);
        return;
      }
      throw erro;
    }
    avisar({ texto: "Senha nova salva. Entre com ela." });
    router.replace(`/entrar?email=${encodeURIComponent(email!)}`);
  }

  return (
    <AuthScreen
      voltarPara="/entrar"
      rotuloVoltar="Voltar para entrar"
      titulo="Crie uma senha nova"
      texto="Depois de salvar, os aparelhos em que você estava conectado saem da conta."
    >
      <ResetPasswordForm aoEnviar={salvar} />
    </AuthScreen>
  );
}
