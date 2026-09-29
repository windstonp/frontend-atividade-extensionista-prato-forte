"use client";

import { useSearchParams } from "next/navigation";
import { useLogin, useRedirecionarSeLogado } from "../hooks";
import { AuthScreen } from "./AuthScreen";
import { LoginForm } from "./LoginForm";

/** N02 — o destino (etapa pendente, `?voltar=` seguro ou Hoje) sai de `useRedirecionarSeLogado`. */
export function EntrarTela() {
  useRedirecionarSeLogado();
  const entrar = useLogin();
  const email = useSearchParams().get("email") ?? "";

  return (
    <AuthScreen
      voltarPara="/"
      rotuloVoltar="Voltar para o início"
      titulo="Que bom te ver de novo"
      texto="Entre com o e-mail e a senha da sua conta."
    >
      <LoginForm emailInicial={email} aoEnviar={(dados) => entrar.mutateAsync(dados)} />
    </AuthScreen>
  );
}
