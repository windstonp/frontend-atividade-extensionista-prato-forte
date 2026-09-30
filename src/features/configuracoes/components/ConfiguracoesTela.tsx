"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { Segmento } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toaster";
import { ContaSection } from "@/features/auth/components/ContaSection";
import { usePerfil } from "@/features/perfil/hooks";
import { enviarInscricao } from "@/lib/api/configuracoes";
import { comoApiError } from "@/lib/api/errors";
import { inscrever, inscricaoAtual, jsonDaInscricao, suportePush } from "@/lib/push";
import { Button } from "@/components/ui/Button";
import { useConfiguracoes, useSalvarConfiguracoes } from "../hooks";
import type { Avisos, SistemaDeMedidas } from "../tipos";
import { AvisosNoCelular, type EstadoDosAvisos } from "./AvisosNoCelular";

/** S19 — avisos no celular, medidas e conta (RF26, RF30). */
export function ConfiguracoesTela() {
  const avisar = useToast();
  const configuracoes = useConfiguracoes();
  const salvar = useSalvarConfiguracoes();
  const perfil = usePerfil();
  const [negada, setNegada] = useState(false);
  const [inscrevendo, setInscrevendo] = useState(false);
  const dados = configuracoes.data;
  // A inscrição deste celular (não a contagem do servidor, que inclui outros aparelhos).
  const local = useQuery({ queryKey: ["push-local"], queryFn: inscricaoAtual, enabled: suportePush() === "ok" });
  const versao = process.env.NEXT_PUBLIC_APP_VERSION;

  const suporte = suportePush();
  const estado: EstadoDosAvisos =
    suporte !== "ok" ? suporte : !dados?.push.vapidPublicKey ? "sem-servidor" : negada ? "negada" : "ok";

  /**
   * Garante a inscrição deste navegador no servidor. Pede a permissão só se ainda não há inscrição
   * aqui (CA01); se já há, reenvia (upsert): o servidor pode tê-la perdido ou ela ser de outra conta.
   */
  async function ativarNesteCelular(chaveVapid: string): Promise<boolean> {
    setInscrevendo(true);
    try {
      const atual = await inscricaoAtual();
      const inscricao = atual ? jsonDaInscricao(atual) : await inscrever(chaveVapid);
      if (inscricao === "negada") {
        setNegada(true);
        return false;
      }
      await enviarInscricao(inscricao);
      setNegada(false);
      void local.refetch();
      return true;
    } catch (erro) {
      avisar({ texto: comoApiError(erro).message });
      return false;
    } finally {
      setInscrevendo(false);
    }
  }

  async function mudarAviso(chave: keyof Avisos, valor: boolean) {
    if (!dados) return;
    if (valor && dados.push.vapidPublicKey && !(await ativarNesteCelular(dados.push.vapidPublicKey))) return;
    salvar.mutate({ notifications: { [chave]: valor } });
  }

  const algumLigado = dados ? Object.values(dados.notifications).some(Boolean) : false;
  const faltaNesteCelular = estado === "ok" && algumLigado && local.isSuccess && local.data === null;

  return (
    <Screen>
      <TopBar voltarPara="/perfil" rotuloVoltar="Voltar para o perfil" />

      <main className="flex-1 px-5 pt-1.5">
        <h1 className="animate-entra font-display text-[28px] font-bold tracking-[-0.028em]">Configurações</h1>

        {configuracoes.isError ? (
          <ErrorState
            titulo="Não foi possível carregar suas configurações"
            descricao="Suas escolhas estão salvas. Só a conexão falhou agora."
            aoTentarDeNovo={() => void configuracoes.refetch()}
          />
        ) : !dados ? (
          <div role="status" aria-label="Carregando suas configurações">
            <Skeleton className="mt-6 h-[200px] rounded-3xl" />
            <Skeleton className="mt-4 h-12 rounded-xl" />
          </div>
        ) : (
          <>
            <AvisosNoCelular avisos={dados.notifications} estado={estado} salvando={salvar.isPending || inscrevendo} aoMudar={(c, v) => void mudarAviso(c, v)} />
            {faltaNesteCelular && dados.push.vapidPublicKey ? (
              <div className="mt-3 animate-entra rounded-2xl bg-gema-fraca px-4 py-3.5">
                <p className="text-[13px] leading-snug text-gema-texto">Seus avisos estão ligados, mas este celular ainda não recebe.</p>
                <Button
                  tamanho="media"
                  className="mt-2.5 w-full"
                  carregando={inscrevendo}
                  onClick={() => void ativarNesteCelular(dados.push.vapidPublicKey as string)}
                >
                  Ativar avisos neste celular
                </Button>
              </div>
            ) : null}
            <div className="mt-[22px]">
              <Segmento
                label="Medidas"
                valor={dados.unitSystem}
                onChange={(v: SistemaDeMedidas) => salvar.mutate({ unitSystem: v })}
                opcoes={[
                  { valor: "metric", rotulo: "Quilo e centímetro" },
                  { valor: "imperial", rotulo: "Libra e polegada" },
                ]}
              />
            </div>
          </>
        )}

        <ContaSection />

        <div className="mt-[22px] border-t border-linha pt-[18px]">
          <p className="text-[12.5px] leading-relaxed text-fumo">
            O Prato Forte é um projeto de extensão do curso de Ciência da Computação da UNINTER, feito junto com a academia{" "}
            {perfil.data?.gym ?? "Zfit"}, em {perfil.data?.city ?? "Capivari de Baixo"}.
          </p>
          <p className="mt-2 text-[12.5px] text-fumo">O Prato Forte não substitui o acompanhamento de um(a) nutricionista.</p>
          {versao ? <p className="mt-2 text-[12.5px] text-musgo">Versão {versao}</p> : null}
        </div>
      </main>

      <div className="h-8 shrink-0 area-segura-baixo" />
    </Screen>
  );
}
