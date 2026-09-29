"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { OptionRow } from "@/components/ui/OptionRow";
import { PasswordField } from "@/components/ui/PasswordField";
import { type ApiError, comoApiError, primeirasMensagens } from "@/lib/api/errors";
import { cascata } from "@/lib/motion";
import { type DadosCadastro, type Erros, validarCadastro } from "../schemas";
import { TermoSheet } from "./TermoSheet";

const VAZIO: DadosCadastro = { name: "", email: "", password: "", termsAccepted: false };

/** N01 — formulário de cadastro (apresentacional: quem envia é `aoEnviar`). */
export function RegisterForm({ aoEnviar }: { aoEnviar: (dados: DadosCadastro) => Promise<unknown> }) {
  const [dados, setDados] = useState(VAZIO);
  const [erros, setErros] = useState<Erros<keyof DadosCadastro>>({});
  const [erroGeral, setErroGeral] = useState<ApiError | null>(null);
  const [emailRecusado, setEmailRecusado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [termoAberto, setTermoAberto] = useState(false);

  function mudar<C extends keyof DadosCadastro>(campo: C, valor: DadosCadastro[C]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
    if (campo === "email") setEmailRecusado(false);
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (enviando) return;
    const encontrados = validarCadastro(dados);
    setErros(encontrados);
    setErroGeral(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await aoEnviar(dados); // sucesso: a tela navega; o botão continua ocupado até sair
    } catch (e) {
      const erro = comoApiError(e);
      if (erro.code === "VALIDATION_ERROR") {
        const porCampo = primeirasMensagens(erro.fieldErrors) as Erros<keyof DadosCadastro>;
        setErros(porCampo);
        // Formato já foi conferido aqui; e-mail recusado pelo servidor = já tem conta (RF01 alternativo).
        setEmailRecusado(Boolean(porCampo.email));
      } else {
        setErroGeral(erro);
      }
      setEnviando(false);
    }
  }

  return (
    <form noValidate onSubmit={enviar} className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4">
        <Field
          id="nome"
          label="Nome completo"
          autoComplete="name"
          value={dados.name}
          onChange={(e) => mudar("name", e.target.value)}
          erro={erros.name}
          disabled={enviando}
          className="animate-entra"
          style={cascata(0, 60, 160)}
        />
        <div className="animate-entra" style={cascata(1, 60, 160)}>
          <Field
            id="email"
            type="email"
            label="E-mail"
            autoComplete="email"
            inputMode="email"
            value={dados.email}
            onChange={(e) => mudar("email", e.target.value)}
            erro={erros.email}
            disabled={enviando}
          />
          {emailRecusado && erros.email ? (
            <Link
              href={`/entrar?email=${encodeURIComponent(dados.email.trim())}`}
              className="mt-1.5 inline-block animate-entra text-[13px] font-semibold text-mata underline-offset-2 hover:underline"
            >
              Entrar com este e-mail
            </Link>
          ) : null}
        </div>
        <PasswordField
          id="senha"
          label="Senha"
          autoComplete="new-password"
          ajuda="8 ou mais, com letra e número"
          value={dados.password}
          onChange={(e) => mudar("password", e.target.value)}
          erro={erros.password}
          disabled={enviando}
          className="animate-entra"
          style={cascata(2, 60, 160)}
        />
        <div className="animate-entra" style={cascata(3, 60, 160)}>
          <OptionRow
            quadrado
            compacto
            marcado={dados.termsAccepted}
            onClick={() => mudar("termsAccepted", !dados.termsAccepted)}
            titulo="Li e aceito o termo de uso dos meus dados de saúde"
          />
          <button
            type="button"
            onClick={() => setTermoAberto(true)}
            className="mt-2 text-[13px] font-semibold text-mata underline-offset-2 hover:underline"
          >
            Ler o termo
          </button>
          {erros.termsAccepted ? (
            <p className="mt-1.5 animate-entra text-[12.5px] font-medium text-alerta">{erros.termsAccepted}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-auto animate-entra pt-8" style={cascata(4, 60, 160)}>
        <FormError erro={erroGeral} />
        <Button type="submit" carregando={enviando} rotuloCarregando="Criando…">
          Criar conta
        </Button>
        <Link
          href="/entrar"
          className="mt-2 flex h-11 items-center justify-center text-[14px] font-semibold text-mata"
        >
          Já tenho conta
        </Link>
      </div>

      <TermoSheet aberta={termoAberto} aoFechar={() => setTermoAberto(false)} />
    </form>
  );
}
