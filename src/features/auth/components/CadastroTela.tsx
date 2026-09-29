"use client";

import { useRedirecionarSeLogado, useRegister } from "../hooks";
import { TERMO_VERSAO } from "../termo";
import { AuthScreen } from "./AuthScreen";
import { RegisterForm } from "./RegisterForm";

/** N01 — ao criar, `useRegister` grava `['me']` e `useRedirecionarSeLogado` leva ao onboarding. */
export function CadastroTela() {
  useRedirecionarSeLogado();
  const registrar = useRegister();

  return (
    <AuthScreen
      voltarPara="/"
      rotuloVoltar="Voltar para o início"
      titulo="Vamos começar pela sua conta"
      texto="Assim seu plano fica salvo e você entra de qualquer celular."
    >
      <RegisterForm
        aoEnviar={(dados) =>
          registrar.mutateAsync({ ...dados, passwordConfirmation: dados.password, termsVersion: TERMO_VERSAO })
        }
      />
    </AuthScreen>
  );
}
