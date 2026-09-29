"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";
import { useUpdatePassword } from "../hooks";
import type { DadosTrocaSenha } from "../schemas";
import { AuthScreen } from "./AuthScreen";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function TrocarSenhaTela() {
  const trocar = useUpdatePassword();
  const router = useRouter();
  const avisar = useToast();

  async function salvar(dados: DadosTrocaSenha) {
    await trocar.mutateAsync(dados);
    avisar({ texto: "Senha trocada." });
    router.push("/perfil/configuracoes");
  }

  return (
    <AuthScreen
      voltarPara="/perfil/configuracoes"
      rotuloVoltar="Voltar para configurações"
      titulo="Trocar senha"
      texto="Depois da troca, os outros aparelhos saem da conta. Este continua conectado."
    >
      <ChangePasswordForm aoEnviar={salvar} />
    </AuthScreen>
  );
}
