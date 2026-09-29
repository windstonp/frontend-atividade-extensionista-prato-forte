"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { PasswordField } from "@/components/ui/PasswordField";
import { type ApiError, comoApiError, primeirasMensagens } from "@/lib/api/errors";
import { cascata } from "@/lib/motion";
import { type DadosNovaSenha, type Erros, validarNovaSenha } from "../schemas";

/** N04 — nova senha + confirmação (apresentacional). */
export function ResetPasswordForm({ aoEnviar }: { aoEnviar: (dados: DadosNovaSenha) => Promise<unknown> }) {
  const [dados, setDados] = useState<DadosNovaSenha>({ password: "", passwordConfirmation: "" });
  const [erros, setErros] = useState<Erros<keyof DadosNovaSenha>>({});
  const [erroGeral, setErroGeral] = useState<ApiError | null>(null);
  const [enviando, setEnviando] = useState(false);

  function mudar(campo: keyof DadosNovaSenha, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (enviando) return;
    const encontrados = validarNovaSenha(dados);
    setErros(encontrados);
    setErroGeral(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await aoEnviar(dados);
    } catch (e) {
      const erro = comoApiError(e);
      if (erro.code === "VALIDATION_ERROR") setErros(primeirasMensagens(erro.fieldErrors) as Erros<keyof DadosNovaSenha>);
      else setErroGeral(erro);
      setEnviando(false);
    }
  }

  return (
    <form noValidate onSubmit={enviar} className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4">
        <PasswordField
          id="nova-senha"
          label="Nova senha"
          autoComplete="new-password"
          ajuda="8 ou mais, com letra e número"
          value={dados.password}
          onChange={(e) => mudar("password", e.target.value)}
          erro={erros.password}
          disabled={enviando}
          className="animate-entra"
          style={cascata(0, 60, 160)}
        />
        <PasswordField
          id="confirmacao"
          label="Confirme a nova senha"
          autoComplete="new-password"
          value={dados.passwordConfirmation}
          onChange={(e) => mudar("passwordConfirmation", e.target.value)}
          erro={erros.passwordConfirmation}
          disabled={enviando}
          className="animate-entra"
          style={cascata(1, 60, 160)}
        />
      </div>
      <div className="mt-auto animate-entra pt-8" style={cascata(2, 60, 160)}>
        <FormError erro={erroGeral} />
        <Button type="submit" carregando={enviando} rotuloCarregando="Salvando…">
          Salvar senha
        </Button>
      </div>
    </form>
  );
}
