"use client";

import Link from "next/link";
import { useState } from "react";
import { IconeAvancar } from "@/components/icons";
import { useToast } from "@/components/ui/Toaster";
import { removerInscricao } from "@/lib/api/configuracoes";
import { ApiError } from "@/lib/api/errors";
import { recarregarEm } from "@/lib/navegar";
import { cancelarInscricao } from "@/lib/push";
import { useDeleteAccount, useLogout, useMe } from "../hooks";
import { DeleteAccountSheet } from "./DeleteAccountSheet";

const linha = "flex min-h-[62px] w-full items-center gap-3.5 border-b border-fio py-3 text-left";

/** Bloco "Sua conta" de Configurações (S19): e-mail, trocar senha, sair, apagar. */
export function ContaSection() {
  const { data: user } = useMe();
  const sair = useLogout();
  const apagar = useDeleteAccount();
  const avisar = useToast();
  const [folhaAberta, setFolhaAberta] = useState(false);

  async function aoSair() {
    // CA07: este navegador para de receber avisos. Falhar aqui (offline) não impede sair.
    try {
      const endpoint = await cancelarInscricao();
      if (endpoint) await removerInscricao(endpoint);
    } catch {
      /* segue para o logout */
    }
    try {
      await sair.mutateAsync();
      recarregarEm("/"); // recarga = cache, formulários e sessão do cliente zerados (RF03)
    } catch (erro) {
      // 401: a sessão já tinha acabado — para quem tocou em "Sair", o resultado é o mesmo.
      if (erro instanceof ApiError && erro.status === 401) recarregarEm("/");
      else avisar({ texto: "Não deu para sair agora. Tente de novo." });
    }
  }

  async function aoApagar(senha: string) {
    await apagar.mutateAsync(senha);
    recarregarEm("/?conta=apagada");
  }

  return (
    <>
      <h2 className="mt-[22px] text-[12.5px] font-semibold text-fumo">Sua conta</h2>
      <div className="mt-2.5 rounded-[20px] bg-white px-[18px]">
        <div className="flex min-h-[62px] items-center border-b border-fio py-3">
          <div className="flex-1">
            <p className="text-[15px] font-semibold">E-mail</p>
            <p className="mt-0.5 text-[13px] text-fumo">{user?.email ?? "…"}</p>
          </div>
        </div>
        <Link href="/perfil/configuracoes/senha" className={linha}>
          <span className="flex-1 text-[15px] font-semibold">Trocar senha</span>
          <IconeAvancar size={18} className="shrink-0 text-fumo" />
        </Link>
        <button type="button" onClick={aoSair} disabled={sair.isPending} className={linha}>
          <span className="flex-1 text-[15px] font-semibold">{sair.isPending ? "Saindo…" : "Sair desta conta"}</span>
          <IconeAvancar size={18} className="shrink-0 text-fumo" />
        </button>
        <button
          type="button"
          onClick={() => setFolhaAberta(true)}
          className="flex min-h-[62px] w-full items-center py-3 text-left"
        >
          <span className="flex-1 text-[15px] font-semibold text-alerta">Apagar minha conta e meus dados</span>
        </button>
      </div>
      <DeleteAccountSheet aberta={folhaAberta} aoFechar={() => setFolhaAberta(false)} aoApagar={aoApagar} />
    </>
  );
}
