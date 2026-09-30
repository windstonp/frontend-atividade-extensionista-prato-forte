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
import type { Profile } from "./types";

/** Protótipo que sobra para Configurações até o Plano 07. */
interface PlanState {
  carregando: boolean;
  erro: string | null;
  profile: Profile | null;
  recarregar: () => void;
}

const Contexto = createContext<PlanState | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setProfile(await api.getProfile());
    } catch {
      setErro("Não foi possível carregar seu plano de hoje.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const valor = useMemo<PlanState>(
    () => ({
      carregando,
      erro,
      profile,
      recarregar: () => void carregar(),
    }),
    [carregando, erro, profile, carregar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePlan() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("usePlan precisa estar dentro de <PlanProvider>");
  return ctx;
}
