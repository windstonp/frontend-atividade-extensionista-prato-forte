"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { PasswordField } from "@/components/ui/PasswordField";
import { type ApiError, comoApiError, primeirasMensagens } from "@/lib/api/errors";
import { cascata } from "@/lib/motion";
import { type DadosLogin, type Erros, validarLogin } from "../schemas";

/** N02 — formulário de login (apresentacional). */
export function LoginForm({
  aoEnviar,
  emailInicial = "",
}: {
  aoEnviar: (dados: DadosLogin) => Promise<unknown>;
  emailInicial?: string;
}) {
  const [dados, setDados] = useState<DadosLogin>({ email: emailInicial, password: "" });
  const [erros, setErros] = useState<Erros<keyof DadosLogin>>({});
  const [erroGeral, setErroGeral] = useState<ApiError | null>(null);
  const [enviando, setEnviando] = useState(false);
  const campoEmail = useRef<HTMLInputElement>(null);

  function mudar(campo: keyof DadosLogin, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (enviando) return;
    const encontrados = validarLogin(dados);
    setErros(encontrados);
    setErroGeral(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await aoEnviar(dados);
    } catch (e) {
      const erro = comoApiError(e);
      if (erro.code === "VALIDATION_ERROR") {
        setErros(primeirasMensagens(erro.fieldErrors) as Erros<keyof DadosLogin>);
      } else {
        setErroGeral(erro);
        // Credenciais erradas: a mensagem não diz qual campo (CA04); o foco volta ao e-mail.
        if (erro.code === "INVALID_CREDENTIALS") setTimeout(() => campoEmail.current?.focus());
      }
      setEnviando(false);
    }
  }

  return (
    <form noValidate onSubmit={enviar} className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4">
        <Field
          ref={campoEmail}
          id="email"
          type="email"
          label="E-mail"
          autoComplete="email"
          inputMode="email"
          value={dados.email}
          onChange={(e) => mudar("email", e.target.value)}
          erro={erros.email}
          disabled={enviando}
          className="animate-entra"
          style={cascata(0, 60, 160)}
        />
        <div className="animate-entra" style={cascata(1, 60, 160)}>
          <PasswordField
            id="senha"
            label="Senha"
            autoComplete="current-password"
            value={dados.password}
            onChange={(e) => mudar("password", e.target.value)}
            erro={erros.password}
            disabled={enviando}
          />
          <Link
            href="/senha/esqueci"
            className="mt-2.5 inline-block text-[13px] font-semibold text-mata underline-offset-2 hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>

      <div className="mt-auto animate-entra pt-8" style={cascata(2, 60, 160)}>
        <FormError erro={erroGeral} focar={erroGeral?.code !== "INVALID_CREDENTIALS"} />
        <Button type="submit" carregando={enviando} rotuloCarregando="Entrando…">
          Entrar
        </Button>
        <Link
          href="/cadastro"
          className="mt-2 flex h-11 items-center justify-center text-[14px] font-semibold text-mata"
        >
          Criar conta
        </Link>
      </div>
    </form>
  );
}
