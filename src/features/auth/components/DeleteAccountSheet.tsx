"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { PasswordField } from "@/components/ui/PasswordField";
import { Sheet } from "@/components/ui/Sheet";
import { type ApiError, comoApiError } from "@/lib/api/errors";
import { cascata } from "@/lib/motion";
import { MENSAGENS } from "../schemas";

const O_QUE_SOME = [
  "Seu perfil e suas preferências",
  "Seu plano alimentar",
  "Suas pesagens",
  "Suas conversas com o Nutri",
  "Suas avaliações",
];

/** N07 — confirmação com senha; `aoApagar` rejeita com ApiError quando a senha não confere. */
export function DeleteAccountSheet({
  aberta,
  aoFechar,
  aoApagar,
}: {
  aberta: boolean;
  aoFechar: () => void;
  aoApagar: (senha: string) => Promise<unknown>;
}) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [erroGeral, setErroGeral] = useState<ApiError | null>(null);
  const [apagando, setApagando] = useState(false);

  async function apagar(evento: React.FormEvent) {
    evento.preventDefault();
    if (apagando) return;
    setErroGeral(null);
    if (!senha) {
      setErro(MENSAGENS.senhaVazia);
      return;
    }

    setApagando(true);
    try {
      await aoApagar(senha);
    } catch (e) {
      const falha = comoApiError(e);
      if (falha.code === "VALIDATION_ERROR") setErro(falha.fieldErrors.password?.[0] ?? falha.message);
      else setErroGeral(falha);
      setApagando(false);
    }
  }

  return (
    <Sheet aberta={aberta} aoFechar={aoFechar} tom="destrutivo" titulo="Apagar sua conta?" descricao="Isto apaga, de vez:">
      <form noValidate onSubmit={apagar}>
        <ul className="mt-3 flex flex-col gap-1.5 text-[14px] text-tinta">
          {O_QUE_SOME.map((item, i) => (
            <li key={item} className="flex animate-entra items-center gap-2.5" style={cascata(i, 45, 100)}>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-alerta" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 animate-pop rounded-xl bg-alerta-fraca px-3.5 py-2.5 text-[13.5px] font-semibold text-alerta-texto">
          Não dá para desfazer.
        </p>
        <PasswordField
          id="senha-apagar"
          label="Sua senha"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            setErro(undefined);
          }}
          erro={erro}
          disabled={apagando}
          className="mt-5"
        />
        <div className="mt-6">
          <FormError erro={erroGeral} />
          <Button type="submit" variante="destrutiva" carregando={apagando} rotuloCarregando="Apagando…">
            Apagar tudo
          </Button>
          <Button variante="texto" className="mt-1" onClick={aoFechar} disabled={apagando}>
            Cancelar
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
