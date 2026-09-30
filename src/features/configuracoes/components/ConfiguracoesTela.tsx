"use client";

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
import { inscrever, inscricaoAtual, suportePush } from "@/lib/push";
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
  const versao = process.env.NEXT_PUBLIC_APP_VERSION;

  const suporte = suportePush();
  const estado: EstadoDosAvisos =
    suporte !== "ok" ? suporte : !dados?.push.vapidPublicKey ? "sem-servidor" : negada ? "negada" : "ok";

  async function mudarAviso(chave: keyof Avisos, valor: boolean) {
    if (!dados) return;
    if (valor && dados.push.vapidPublicKey) {
      setInscrevendo(true);
      try {
        // A permissão é pedida só aqui, ao ligar (CA01); a inscrição é a deste navegador.
        if (!(await inscricaoAtual())) {
          const inscricao = await inscrever(dados.push.vapidPublicKey);
          if (inscricao === "negada") {
            setNegada(true);
            return;
          }
          await enviarInscricao(inscricao);
        }
        setNegada(false);
      } catch (erro) {
        avisar({ texto: comoApiError(erro).message });
        return;
      } finally {
        setInscrevendo(false);
      }
    }
    salvar.mutate({ notifications: { [chave]: valor } });
  }

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
          {versao ? <p className="mt-2 text-[12.5px] text-musgo">Versão {versao}</p> : null}
        </div>
      </main>

      <div className="h-8 shrink-0 area-segura-baixo" />
    </Screen>
  );
}
