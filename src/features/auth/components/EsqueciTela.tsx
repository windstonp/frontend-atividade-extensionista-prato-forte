"use client";

import { useForgotPassword } from "../hooks";
import { AuthScreen } from "./AuthScreen";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function EsqueciTela() {
  const pedir = useForgotPassword();

  return (
    <AuthScreen
      voltarPara="/entrar"
      rotuloVoltar="Voltar para entrar"
      titulo="Vamos recuperar seu acesso"
      texto="Digite o e-mail da sua conta. Mandamos um link para você criar uma senha nova."
    >
      <ForgotPasswordForm aoEnviar={(email) => pedir.mutateAsync(email)} />
    </AuthScreen>
  );
}
