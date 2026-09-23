"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconeMais, IconeMenos } from "@/components/icons";
import { dataPorExtenso, peso } from "@/lib/format";
import { usePlan } from "@/lib/plan-store";
import { cascata } from "@/lib/motion";
import { CountUp } from "@/components/ui/CountUp";

export default function RegistrarPeso() {
  const router = useRouter();
  const { carregando, profile, weighIns, registrarPeso } = usePlan();
  const [valor, setValor] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (carregando || !profile) {
    return (
      <Screen>
        <TopBar voltarPara="/evolucao" rotuloVoltar="Voltar para a evolução" />
        <main className="flex-1 px-5 pt-3">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="mt-6 h-[220px] rounded-3xl" />
        </main>
      </Screen>
    );
  }

  const ultimo = weighIns[weighIns.length - 1];
  const atual = valor ?? Number((profile.weightKg + 0.2).toFixed(1));
  const diferenca = ultimo ? atual - ultimo.weightKg : 0;
  const gramasDiferenca = Math.round(Math.abs(diferenca) * 1000);
  // a régua mostra um quilo para cada lado da última pesagem
  const base = ultimo?.weightKg ?? profile.weightKg;
  const posicao = 50 + ((atual - base) / 2) * 100;

  const ajustar = (delta: number) =>
    setValor(Number((atual + delta).toFixed(1)));

  async function salvar() {
    setSalvando(true);
    await registrarPeso(atual);
    router.push("/evolucao");
  }

  const historico = [...weighIns].reverse().slice(0, 4);

  return (
    <Screen>
      <TopBar voltarPara="/evolucao" rotuloVoltar="Voltar para a evolução" />

      <main className="flex-1 px-5 pt-2">
        <h1 className="animate-entra font-display text-[30px] leading-tight font-bold tracking-[-0.03em]">
          Quanto a balança marcou?
        </h1>
        <p
          className="mt-2 animate-entra text-sm leading-normal text-fumo"
          style={{ animationDelay: "80ms" }}
        >
          {dataPorExtenso(new Date().toISOString().slice(0, 10))}.
        </p>

        <section
          className="mt-[22px] animate-escala rounded-[20px] bg-white px-[18px] pt-[22px] pb-[18px]"
          style={{ animationDelay: "140ms" }}
        >
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              aria-label="Diminuir 100 gramas"
              onClick={() => ajustar(-0.1)}
              className="flex size-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-linha bg-white transition-[border-color,background-color,transform] duration-250 hover:border-tinta hover:bg-papel active:scale-90"
            >
              <IconeMenos size={20} />
            </button>
            <p
              className="font-display text-[58px] leading-none font-bold tracking-[-0.04em] tabular-nums"
              aria-live="polite"
            >
              <CountUp valor={atual} casas={1} duracao={420} />{" "}
              <span className="text-xl font-semibold tracking-normal text-fumo">kg</span>
            </p>
            <button
              type="button"
              aria-label="Aumentar 100 gramas"
              onClick={() => ajustar(0.1)}
              className="flex size-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-linha bg-white transition-[border-color,background-color,transform] duration-250 hover:border-tinta hover:bg-papel active:scale-90"
            >
              <IconeMais size={20} />
            </button>
          </div>

          <div className="relative mt-[18px] h-[38px]" aria-hidden="true">
            <div className="absolute inset-x-0 bottom-3 flex items-end justify-between">
              {Array.from({ length: 11 }, (_, i) => (
                <span
                  key={i}
                  className={`block w-px origin-bottom animate-entra ${
                    i % 2 ? "h-4 bg-[#c3ccc0]" : "h-2.5 bg-linha"
                  }`}
                  style={cascata(i, 28, 260)}
                />
              ))}
            </div>
            <span
              className="absolute bottom-1.5 block h-7 w-[3px] -translate-x-1/2 rounded-sm bg-gema transition-[left] duration-400 ease-[cubic-bezier(.34,1.56,.64,1)]"
              style={{ left: `${Math.min(96, Math.max(4, posicao))}%` }}
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10.5px] text-fumo">
              <span>{(base - 1).toFixed(1).replace(".", ",")}</span>
              <span>{base.toFixed(1).replace(".", ",")}</span>
              <span>{(base + 1).toFixed(1).replace(".", ",")}</span>
            </div>
          </div>

          <p className="mt-3.5 border-t border-fio pt-3.5 text-[13px] leading-normal text-fumo">
            {ultimo && gramasDiferenca > 0
              ? `São ${gramasDiferenca} g ${diferenca > 0 ? "a mais" : "a menos"} que na semana passada. ${
                  diferenca > 0
                    ? "Dentro do esperado para quem está ganhando massa."
                    : "Vale conferir se a semana teve menos refeições no plano."
                }`
              : "Mesmo peso da semana passada. Uma semana estável é normal."}
          </p>
        </section>

        <h2
          className="mt-[22px] animate-entra font-display text-[15px] font-semibold"
          style={{ animationDelay: "300ms" }}
        >
          Suas pesagens
        </h2>
        <ul className="mt-2.5 list-none rounded-[20px] bg-white px-[18px]">
          {historico.map((p, i) => {
            const anterior = weighIns[weighIns.length - 1 - i - 1];
            const delta = anterior ? p.weightKg - anterior.weightKg : 0;
            return (
              <li
                key={p.date}
                style={cascata(i, 60, 360)}
                className={`flex animate-entra-lado-esq items-center gap-3 py-[13px] ${
                  i < historico.length - 1 ? "border-b border-fio" : ""
                }`}
              >
                <span className="flex-1 text-sm">{dataPorExtenso(p.date).split(", ")[1]}</span>
                <span className="w-16 text-right text-sm font-semibold tabular-nums">
                  {peso(p.weightKg)}
                </span>
                <span
                  className={`w-14 text-right text-[12.5px] font-semibold ${
                    delta >= 0 ? "text-mata" : "text-fumo"
                  }`}
                >
                  {anterior
                    ? `${delta >= 0 ? "+" : "−"}${Math.round(Math.abs(delta) * 1000)} g`
                    : "início"}
                </span>
              </li>
            );
          })}
        </ul>
      </main>

      <footer
        className="flex shrink-0 animate-entra flex-col gap-2.5 px-5 pt-3.5 pb-7 area-segura-baixo"
        style={{ animationDelay: "520ms" }}
      >
        <Button onClick={salvar} disabled={salvando}>
          {salvando ? (
            <>
              <span className="size-4 animate-girar rounded-full border-2 border-tinta/25 border-t-tinta" />
              Salvando
            </>
          ) : (
            "Salvar peso de hoje"
          )}
        </Button>
        <p className="text-center text-[12.5px] text-fumo">
          Pese-se de manhã, antes de comer, sempre na mesma balança.
        </p>
      </footer>
    </Screen>
  );
}
