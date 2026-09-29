"use client";

import { useState } from "react";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { Segmento } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePlan } from "@/lib/plan-store";
import { ContaSection } from "@/features/auth/components/ContaSection";

export default function Configuracoes() {
  const { carregando, profile } = usePlan();
  const [avisos, setAvisos] = useState({
    refeicao: true,
    semana: true,
    dicas: false,
  });
  const [unidade, setUnidade] = useState<"metrico" | "imperial">("metrico");

  if (carregando || !profile) {
    return (
      <Screen>
        <TopBar voltarPara="/perfil" rotuloVoltar="Voltar para o perfil" />
        <main className="flex-1 px-5 pt-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-6 h-[220px] rounded-3xl" />
        </main>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar voltarPara="/perfil" rotuloVoltar="Voltar para o perfil" />

      <main className="flex-1 px-5 pt-1.5">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.028em]">
          Configurações
        </h1>

        <h2 className="mt-[22px] text-[12.5px] font-semibold text-fumo">
          Avisos no celular
        </h2>
        <div className="mt-2.5 rounded-[20px] bg-white px-[18px]">
          <div className="border-b border-fio">
            <Toggle
              ligado={avisos.refeicao}
              onChange={(v) => setAvisos({ ...avisos, refeicao: v })}
              rotulo="Lembrete de refeição"
              descricao="15 minutos antes de cada horário"
            />
          </div>
          <div className="border-b border-fio">
            <Toggle
              ligado={avisos.semana}
              onChange={(v) => setAvisos({ ...avisos, semana: v })}
              rotulo="Resumo da semana"
              descricao="Todo domingo à noite"
            />
          </div>
          <Toggle
            ligado={avisos.dicas}
            onChange={(v) => setAvisos({ ...avisos, dicas: v })}
            rotulo="Dicas do Nutri"
            descricao="No máximo duas por semana"
          />
        </div>

        <h2 className="mt-[22px] mb-2.5 text-[12.5px] font-semibold text-fumo">Medidas</h2>
        <Segmento
          valor={unidade}
          onChange={setUnidade}
          opcoes={[
            { valor: "metrico", rotulo: "Quilo e centímetro" },
            { valor: "imperial", rotulo: "Libra e polegada" },
          ]}
        />

        <ContaSection />

        <div className="mt-[22px] border-t border-linha pt-[18px]">
          <p className="text-[12.5px] leading-relaxed text-fumo">
            O Prato Forte é um projeto de extensão do curso de Ciência da Computação da
            UNINTER, feito junto com a academia {profile.gym}, em {profile.city}.
          </p>
          <p className="mt-2 text-[12.5px] text-musgo">
            Versão 0.9, protótipo de validação
          </p>
        </div>
      </main>

      <div className="h-8 shrink-0 area-segura-baixo" />
    </Screen>
  );
}
