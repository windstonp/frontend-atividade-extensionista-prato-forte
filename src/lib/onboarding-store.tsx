"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { OnboardingAnswers } from "./types";

const CHAVE = "prato-forte:onboarding:v1";

export const ETAPAS = [
  { slug: "objetivo", titulo: "Objetivo" },
  { slug: "dados", titulo: "Dados básicos" },
  { slug: "atividade", titulo: "Nível de atividade" },
  { slug: "preferencias", titulo: "Preferências" },
  { slug: "restricoes", titulo: "Restrições" },
  { slug: "rotina", titulo: "Rotina" },
  { slug: "resumo", titulo: "Resumo" },
] as const;

export const TOTAL_ETAPAS = ETAPAS.length;

export const RESPOSTAS_INICIAIS: OnboardingAnswers = {
  goal: "ganhar-massa",
  name: "",
  age: "",
  heightCm: "",
  weightKg: "",
  sex: "feminino",
  activity: "moderado",
  workPosture: "sentada",
  pantry: [],
  restrictions: [],
  otherRestriction: "",
  wakeTime: "06:20",
  trainingTime: "19:00",
  sleepTime: "23:00",
  trainingDays: [1, 3, 5],
  lunchPlace: "marmita",
};

interface OnboardingState {
  respostas: OnboardingAnswers;
  atualizar: <K extends keyof OnboardingAnswers>(
    campo: K,
    valor: OnboardingAnswers[K],
  ) => void;
  alternarLista: (
    campo: "pantry" | "restrictions",
    valor: string,
  ) => void;
  alternarDia: (dia: number) => void;
  limpar: () => void;
}

const Contexto = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [respostas, setRespostas] = useState<OnboardingAnswers>(RESPOSTAS_INICIAIS);

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (bruto) setRespostas({ ...RESPOSTAS_INICIAIS, ...JSON.parse(bruto) });
    } catch {
      // sem persistência, o onboarding começa do zero
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(respostas));
    } catch {}
  }, [respostas]);

  const valor = useMemo<OnboardingState>(
    () => ({
      respostas,
      atualizar: (campo, valorNovo) =>
        setRespostas((r) => ({ ...r, [campo]: valorNovo })),
      alternarLista: (campo, item) =>
        setRespostas((r) => {
          const lista = r[campo];
          return {
            ...r,
            [campo]: lista.includes(item)
              ? lista.filter((x) => x !== item)
              : [...lista, item],
          };
        }),
      alternarDia: (dia) =>
        setRespostas((r) => ({
          ...r,
          trainingDays: r.trainingDays.includes(dia)
            ? r.trainingDays.filter((d) => d !== dia)
            : [...r.trainingDays, dia].sort(),
        })),
      limpar: () => setRespostas(RESPOSTAS_INICIAIS),
    }),
    [respostas],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useOnboarding precisa estar dentro de <OnboardingProvider>");
  return ctx;
}
