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
import { totaisConsumidos, totaisDaRefeicao, totaisDoDia } from "./nutrition";
import type {
  DayAdherence,
  DayPlan,
  MealCard,
  Profile,
  Substitution,
  WeighIn,
} from "./types";

const CHAVE = "prato-forte:plano:v1";

interface Alteracao {
  texto: string;
  planoAnterior: DayPlan;
}

interface PlanState {
  carregando: boolean;
  erro: string | null;
  profile: Profile | null;
  plan: DayPlan | null;
  weighIns: WeighIn[];
  adherence: DayAdherence[];
  ultimaAlteracao: Alteracao | null;
  recarregar: () => void;
  alternarRefeicao: (mealId: string) => void;
  substituirAlimento: (mealId: string, foodId: string, sub: Substitution) => void;
  aplicarRefeicao: (mealId: string, card: MealCard) => void;
  registrarPeso: (kg: number) => Promise<void>;
  desfazer: () => void;
  limparAviso: () => void;
}

const Contexto = createContext<PlanState | null>(null);

function resumoDaRefeicao(nomes: string[]) {
  if (nomes.length <= 1) return nomes[0] ?? "";
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`.toLowerCase();
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [weighIns, setWeighIns] = useState<WeighIn[]>([]);
  const [adherence, setAdherence] = useState<DayAdherence[]>([]);
  const [ultimaAlteracao, setUltimaAlteracao] = useState<Alteracao | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [p, d, w, a] = await Promise.all([
        api.getProfile(),
        api.getDayPlan(),
        api.getWeighIns(),
        api.getAdherence(),
      ]);
      setProfile(p);
      setAdherence(a);
      setWeighIns(w);

      let planoSalvo: DayPlan | null = null;
      try {
        const bruto = window.localStorage.getItem(CHAVE);
        if (bruto) {
          const salvo = JSON.parse(bruto) as DayPlan;
          if (salvo?.date === d.date) planoSalvo = salvo;
        }
      } catch {
        // localStorage bloqueado: seguimos com o plano vindo da API
      }
      setPlan(planoSalvo ?? d);
    } catch {
      setErro("Não foi possível carregar seu plano de hoje.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const salvar = useCallback((novo: DayPlan) => {
    setPlan(novo);
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch {
      // sem persistência é aceitável: o estado vive enquanto a aba estiver aberta
    }
  }, []);

  const alternarRefeicao = useCallback(
    (mealId: string) => {
      setPlan((atual) => {
        if (!atual) return atual;
        const novo = {
          ...atual,
          meals: atual.meals.map((m) => (m.id === mealId ? { ...m, done: !m.done } : m)),
        };
        try {
          window.localStorage.setItem(CHAVE, JSON.stringify(novo));
        } catch {}
        return novo;
      });
    },
    [],
  );

  const substituirAlimento = useCallback(
    (mealId: string, foodId: string, sub: Substitution) => {
      if (!plan) return;
      const anterior = plan;
      const saiu = plan.meals
        .find((m) => m.id === mealId)
        ?.items.find((i) => i.id === foodId);

      const meals = plan.meals.map((meal) => {
        if (meal.id !== mealId) return meal;
        const items = meal.items.map((item) =>
          item.id === foodId
            ? {
                id: sub.id,
                name: sub.name,
                amount: sub.amount,
                calories: sub.calories,
                macros: sub.macros,
                replacedFrom: item.name,
              }
            : item,
        );
        return {
          ...meal,
          items,
          summary: resumoDaRefeicao(items.map((i) => i.name)),
        };
      });

      salvar({ ...plan, meals });
      setUltimaAlteracao({
        texto: saiu
          ? `${saiu.name} trocado por ${sub.name.toLowerCase()}`
          : `${sub.name} entrou na refeição`,
        planoAnterior: anterior,
      });
    },
    [plan, salvar],
  );

  const aplicarRefeicao = useCallback(
    (mealId: string, card: MealCard) => {
      if (!plan) return;
      const anterior = plan;
      const meals = plan.meals.map((meal) => {
        if (meal.id !== mealId) return meal;
        const items = card.items.map((item, i) => ({
          id: `${mealId}-nutri-${i}`,
          name: item.name,
          amount: item.amount,
          calories: item.calories,
          macros: {
            protein: card.macros.protein / card.items.length,
            carbs: card.macros.carbs / card.items.length,
            fat: card.macros.fat / card.items.length,
          },
        }));
        return {
          ...meal,
          items,
          summary: resumoDaRefeicao(items.map((i) => i.name)),
        };
      });
      salvar({ ...plan, meals });
      setUltimaAlteracao({
        texto: `${card.title} montado pelo Nutri`,
        planoAnterior: anterior,
      });
    },
    [plan, salvar],
  );

  const registrarPeso = useCallback(async (kg: number) => {
    const nova = await api.saveWeighIn(kg);
    setWeighIns((lista) => [...lista.filter((w) => w.date !== nova.date), nova]);
    setProfile((p) => (p ? { ...p, weightKg: kg } : p));
  }, []);

  const desfazer = useCallback(() => {
    if (!ultimaAlteracao) return;
    salvar(ultimaAlteracao.planoAnterior);
    setUltimaAlteracao(null);
  }, [ultimaAlteracao, salvar]);

  const valor = useMemo<PlanState>(
    () => ({
      carregando,
      erro,
      profile,
      plan,
      weighIns,
      adherence,
      ultimaAlteracao,
      recarregar: () => void carregar(),
      alternarRefeicao,
      substituirAlimento,
      aplicarRefeicao,
      registrarPeso,
      desfazer,
      limparAviso: () => setUltimaAlteracao(null),
    }),
    [
      carregando, erro, profile, plan, weighIns, adherence, ultimaAlteracao,
      carregar, alternarRefeicao, substituirAlimento, aplicarRefeicao, registrarPeso, desfazer,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePlan() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("usePlan precisa estar dentro de <PlanProvider>");
  return ctx;
}

/** Números derivados que várias telas usam */
export function useResumoDoDia() {
  const { plan } = usePlan();
  return useMemo(() => {
    if (!plan) return null;
    const consumido = totaisConsumidos(plan);
    const planejado = totaisDoDia(plan);
    return {
      consumido,
      planejado,
      caloriasRestantes: Math.max(0, Math.round(planejado.calories - consumido.calories)),
      proteinaRestante: Math.max(0, Math.round(planejado.macros.protein - consumido.macros.protein)),
      feitas: plan.meals.filter((m) => m.done).length,
      total: plan.meals.length,
    };
  }, [plan]);
}

export { totaisDaRefeicao };
