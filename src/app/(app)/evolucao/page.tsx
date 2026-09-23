"use client";

import { useState } from "react";
import { BottomNav } from "@/components/app/BottomNav";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { ButtonLink } from "@/components/ui/Button";
import { Rail } from "@/components/ui/Rail";
import { Skeleton } from "@/components/ui/Skeleton";
import { diaCurto, peso } from "@/lib/format";
import { usePlan } from "@/lib/plan-store";
import { cascata } from "@/lib/motion";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import type { AdherenceStatus, WeighIn } from "@/lib/types";

const PERIODOS = [
  { id: "6s", rotulo: "6 semanas", semanas: 6 },
  { id: "3m", rotulo: "3 meses", semanas: 13 },
  { id: "tudo", rotulo: "Tudo", semanas: 999 },
];

const CORES: Record<AdherenceStatus, string> = {
  completo: "bg-mata",
  parcial: "bg-mata-media",
  vazio: "bg-linha",
  hoje: "bg-gema",
};

export default function Evolucao() {
  const { carregando, erro, profile, weighIns, adherence, recarregar } = usePlan();
  const [periodo, setPeriodo] = useState(PERIODOS[0]);

  if (carregando || !profile) {
    return (
      <Screen>
        <main className="flex-1 px-5 pt-5">
          {erro ? (
            <ErrorState
              titulo="Não foi possível carregar sua evolução"
              descricao="Suas pesagens estão salvas. Foi a conexão que falhou."
              aoTentarDeNovo={recarregar}
            />
          ) : (
            <>
              <Skeleton className="h-9 w-44" />
              <Skeleton className="mt-4 h-10" />
              <Skeleton className="mt-4 h-[260px] rounded-3xl" />
              <Skeleton className="mt-4 h-[240px] rounded-3xl" />
            </>
          )}
        </main>
        <BottomNav />
      </Screen>
    );
  }

  const pesagens = weighIns.slice(-periodo.semanas);
  const completos = adherence.filter((d) => d.status === "completo").length;
  const sequencia = contarSequencia(adherence);

  return (
    <Screen>
      <header className="shrink-0 px-5 pt-5 pb-3 area-segura-cima">
        <h1 className="animate-entra font-display text-[26px] font-bold tracking-[-0.025em]">
          Sua evolução
        </h1>
        <div className="mt-3 flex gap-2" role="tablist" aria-label="Período">
          {PERIODOS.map((p, i) => {
            const ativo = p.id === periodo.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setPeriodo(p)}
                style={cascata(i, 60, 100)}
                className={`flex h-[38px] animate-escala items-center rounded-full border px-3.5 text-[13px] transition-[background-color,color,border-color,transform] duration-250 active:scale-95 ${
                  ativo
                    ? "border-tinta bg-tinta font-semibold text-white"
                    : "border-linha bg-white font-medium text-tinta hover:-translate-y-px hover:border-pedra"
                }`}
              >
                {p.rotulo}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 px-5 pt-1">
        {pesagens.length === 0 ? (
          <EvolucaoVazia />
        ) : (
          <GraficoPeso
            pesagens={pesagens}
            meta={profile.goalWeightKg}
            inicio={profile.startWeightKg}
          />
        )}

        <Reveal className="mt-3.5">
        <section className="rounded-[20px] bg-white px-[18px] py-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[15px] font-semibold">Constância</h2>
            <span className="text-[12.5px] text-fumo">últimos {adherence.length} dias</span>
          </div>
          <p className="mt-2 text-[13.5px] leading-snug">
            <b className="font-semibold">{completos} dias</b> com todas as refeições feitas.
            {sequencia > 1 ? ` Sua sequência atual é de ${sequencia} dias.` : ""}
          </p>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {adherence.map((dia, i) => (
              <span
                key={dia.date}
                title={dia.date}
                style={cascata(i, 16, 120)}
                className={`aspect-square animate-pop rounded-lg ${CORES[dia.status]} ${
                  dia.status === "hoje" ? "animate-respira" : ""
                }`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3.5">
            {[
              { cor: "bg-mata", rotulo: "Dia completo" },
              { cor: "bg-mata-media", rotulo: "Parte das refeições" },
              { cor: "bg-gema", rotulo: "Hoje" },
            ].map((l) => (
              <span key={l.rotulo} className="flex items-center gap-1.5 text-[11.5px] text-fumo">
                <span className={`size-2.5 rounded-[3px] ${l.cor}`} />
                {l.rotulo}
              </span>
            ))}
          </div>
        </section>
        </Reveal>

        <Reveal className="mt-3.5" atraso={80}>
        <section>
          <h2 className="mb-2.5 font-display text-[15px] font-semibold">
            Média por dia neste período
          </h2>
          <Rail rotulo="Proteína" valor={112} meta={120} atraso={200} />
          <Rail
            rotulo="Calorias"
            valor={1870}
            meta={1950}
            unidade="kcal"
            cor="bg-gema"
            atraso={280}
          />
          <p className="mt-2 text-[12.5px] leading-snug text-fumo">
            Você fica um pouco abaixo da meta de proteína nos dias sem treino.
          </p>
        </section>
        </Reveal>
      </main>

      <div className="shrink-0 px-5 pt-3.5 pb-2.5">
        <ButtonLink href="/evolucao/peso">Registrar peso da semana</ButtonLink>
      </div>

      <BottomNav />
    </Screen>
  );
}

function GraficoPeso({
  pesagens,
  meta,
  inicio,
}: {
  pesagens: WeighIn[];
  meta: number;
  inicio: number;
}) {
  const atual = pesagens[pesagens.length - 1].weightKg;
  const valores = pesagens.map((p) => p.weightKg);
  const baixo = Math.min(...valores, inicio) - 0.6;
  const alto = Math.max(...valores, meta) + 0.4;
  const y = (v: number) => 108 - ((v - baixo) / (alto - baixo)) * 94;
  const x = (i: number) =>
    pesagens.length === 1 ? 150 : 10 + (i * 280) / (pesagens.length - 1);

  const pontos = pesagens.map((p, i) => ({ px: x(i), py: Number(y(p.weightKg).toFixed(1)) }));
  const linha = pontos.map((p) => `${p.px},${p.py}`).join(" ");
  const area = `${linha} ${x(pesagens.length - 1)},108 10,108`;
  const ganho = atual - inicio;
  // comprimento aproximado do traço, para o gráfico se desenhar da esquerda para a direita
  const comprimento = pontos.reduce(
    (soma, p, i) =>
      i === 0 ? 0 : soma + Math.hypot(p.px - pontos[i - 1].px, p.py - pontos[i - 1].py),
    0,
  );

  return (
    <section
      className="animate-escala rounded-[20px] bg-white px-[18px] pt-4 pb-3.5"
      style={{ animationDelay: "120ms" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-[32px] font-bold tracking-[-0.03em]">
          <CountUp valor={atual} casas={1} duracao={1100} />{" "}
          <span className="text-base font-semibold tracking-normal text-fumo">kg</span>
        </p>
        <span
          className="inline-flex h-[26px] shrink-0 animate-pop items-center rounded-full bg-mata-fraca px-2.5 text-[12.5px] font-semibold text-mata-texto"
          style={{ animationDelay: "700ms" }}
        >
          {ganho >= 0 ? "+" : "−"}
          {Math.abs(ganho).toLocaleString("pt-BR", { minimumFractionDigits: 1 })} kg em{" "}
          {pesagens.length} semanas
        </span>
      </div>

      <svg
        viewBox="0 0 300 132"
        width="100%"
        height={132}
        role="img"
        aria-label={`Peso de ${peso(pesagens[0].weightKg)} para ${peso(atual)}, com meta de ${peso(meta)}`}
        className="mt-3 block overflow-visible"
      >
        <line
          x1="0"
          y1={y(meta)}
          x2="300"
          y2={y(meta)}
          stroke="var(--color-pedra)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <text
          x="0"
          y={y(meta) - 5}
          fontSize="10"
          fill="var(--color-fumo)"
          fontFamily="var(--font-sans)"
        >
          meta {peso(meta)}
        </text>
        <polygon
          points={area}
          fill="#edefe9"
          className="animate-fade"
          style={{ animationDelay: "900ms", animationDuration: "600ms" }}
        />
        <polyline
          points={linha}
          fill="none"
          stroke="var(--color-tinta)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="desenha"
          style={{ "--tamanho-traco": comprimento } as React.CSSProperties}
        />
        {pesagens.slice(0, -1).map((p, i) => (
          <circle
            key={p.date}
            cx={x(i)}
            cy={y(p.weightKg)}
            r="2.6"
            fill="var(--color-pedra)"
            className="animate-pop"
            style={{
              animationDelay: `${240 + i * 150}ms`,
              transformOrigin: `${x(i)}px ${y(p.weightKg)}px`,
            }}
          />
        ))}
        <circle
          cx={x(pesagens.length - 1)}
          cy={y(atual)}
          r="9"
          fill="var(--color-gema)"
          opacity="0.22"
          className="animate-halo"
          style={{ transformOrigin: `${x(pesagens.length - 1)}px ${y(atual)}px` }}
        />
        <circle
          cx={x(pesagens.length - 1)}
          cy={y(atual)}
          r="6"
          fill="#ffffff"
          className="animate-pop"
          style={{
            animationDelay: "1150ms",
            transformOrigin: `${x(pesagens.length - 1)}px ${y(atual)}px`,
          }}
        />
        <circle
          cx={x(pesagens.length - 1)}
          cy={y(atual)}
          r="4.5"
          fill="var(--color-gema)"
          className="animate-pop"
          style={{
            animationDelay: "1200ms",
            transformOrigin: `${x(pesagens.length - 1)}px ${y(atual)}px`,
          }}
        />
        <line x1="0" y1="120" x2="300" y2="120" stroke="var(--color-fio)" strokeWidth="1" />
      </svg>

      <div className="mt-1.5 flex justify-between text-[10.5px] text-fumo">
        {pesagens.map((p, i) => (
          <span key={p.date} className="animate-entra" style={cascata(i, 80, 400)}>
            {diaCurto(p.date)}
          </span>
        ))}
      </div>

      <p
        className="mt-3 animate-entra border-t border-fio pt-3 text-[13px] leading-normal text-fumo"
        style={{ animationDelay: "1000ms" }}
      >
        {ganho > 0
          ? "No ritmo das últimas semanas, você chega na meta por volta do fim de janeiro."
          : "Registre mais uma pesagem para o Nutri estimar quando você chega na meta."}
      </p>
    </section>
  );
}

function EvolucaoVazia() {
  return (
    <section className="rounded-[20px] bg-white p-[18px]">
      <svg
        viewBox="0 0 300 120"
        width="100%"
        height={120}
        role="img"
        aria-label="Gráfico ainda sem pesagens registradas"
        className="block"
      >
        <line x1="0" y1="14" x2="300" y2="14" stroke="var(--color-linha)" strokeWidth="1" strokeDasharray="4 4" />
        <text x="0" y="10" fontSize="10" fill="var(--color-musgo)">
          sua meta
        </text>
        <line
          x1="10" y1="96" x2="290" y2="96"
          stroke="var(--color-linha)" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round"
        />
        <circle
          cx="10"
          cy="96"
          r="5.5"
          fill="#ffffff"
          stroke="var(--color-pedra)"
          strokeWidth="2"
          className="animate-respira"
        />
      </svg>
      <h2 className="mt-4 font-display text-xl leading-tight font-bold tracking-[-0.02em]">
        Sua linha começa na primeira pesagem
      </h2>
      <p className="mt-2 text-sm leading-normal text-fumo">
        Registre o peso hoje e repita uma vez por semana. Em um mês já dá para ver para
        onde a linha está indo.
      </p>
      <ButtonLink href="/evolucao/peso" className="mt-4">
        Registrar meu peso
      </ButtonLink>
    </section>
  );
}

function contarSequencia(dias: { status: AdherenceStatus }[]) {
  let n = 0;
  for (let i = dias.length - 1; i >= 0; i--) {
    if (dias[i].status === "hoje") continue;
    if (dias[i].status === "completo") n++;
    else break;
  }
  return n;
}
