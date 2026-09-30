"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as api from "./mock-api";
import type { DayAdherence, Profile, WeighIn } from "./types";

/** Protótipo que sobra para Evolução e Configurações até os Planos 06 e 07. */
interface PlanState {
  carregando: boolean;
  erro: string | null;
  profile: Profile | null;
  weighIns: WeighIn[];
  adherence: DayAdherence[];
  recarregar: () => void;
  registrarPeso: (kg: number) => Promise<void>;
}

const Contexto = createContext<PlanState | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weighIns, setWeighIns] = useState<WeighIn[]>([]);
  const [adherence, setAdherence] = useState<DayAdherence[]>([]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [p, w, a] = await Promise.all([api.getProfile(), api.getWeighIns(), api.getAdherence()]);
      setProfile(p);
      setAdherence(a);
      setWeighIns(w);
    } catch {
      setErro("Não foi possível carregar seu plano de hoje.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const registrarPeso = useCallback(async (kg: number) => {
    const nova = await api.saveWeighIn(kg);
    setWeighIns((lista) => [...lista.filter((w) => w.date !== nova.date), nova]);
    setProfile((p) => (p ? { ...p, weightKg: kg } : p));
  }, []);

  const valor = useMemo<PlanState>(
    () => ({
      carregando,
      erro,
      profile,
      weighIns,
      adherence,
      recarregar: () => void carregar(),
      registrarPeso,
    }),
    [carregando, erro, profile, weighIns, adherence, carregar, registrarPeso],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePlan() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("usePlan precisa estar dentro de <PlanProvider>");
  return ctx;
}
