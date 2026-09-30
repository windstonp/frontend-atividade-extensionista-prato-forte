"use client";

import Link from "next/link";
import { BottomNav } from "@/components/app/BottomNav";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { IconeAjustes, IconeAvancar } from "@/components/icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCatalogo } from "@/features/onboarding/hooks";
import { peso } from "@/lib/format";
import { DIAS_CURTOS } from "@/lib/labels";
import { cascata } from "@/lib/motion";
import { desdeQuando, iniciais, metros } from "../formato";
import { usePerfil } from "../hooks";
import type { Perfil } from "../tipos";
import type { Catalogo } from "@/features/onboarding/tipos";
import { GoalCard } from "./GoalCard";
import { RefazerPlano } from "./RefazerPlano";

/** S17 — Perfil vindo de `GET /profile`; os rótulos vêm do catálogo. */
export function PerfilTela() {
  const perfil = usePerfil();
  const catalogo = useCatalogo();

  if (perfil.error || catalogo.error) {
    return (
      <Screen>
        <main className="flex-1 pt-6">
          <ErrorState
            titulo="Não foi possível carregar seu perfil"
            descricao="Confira a internet e tente de novo."
            aoTentarDeNovo={() => {
              void perfil.refetch();
              void catalogo.refetch();
            }}
          />
        </main>
        <BottomNav />
      </Screen>
    );
  }

  if (!perfil.data || !catalogo.data) {
    return (
      <Screen>
        <main className="flex-1 px-5 pt-6" aria-busy="true" aria-label="Carregando seu perfil">
          <Skeleton className="h-16" />
          <Skeleton className="mt-4 h-[200px] rounded-3xl" atraso={90} />
          <Skeleton className="mt-4 h-[320px] rounded-3xl" atraso={180} />
        </main>
        <BottomNav />
      </Screen>
    );
  }

  return <Conteudo perfil={perfil.data} catalogo={catalogo.data} />;
}

function Conteudo({ perfil, catalogo }: { perfil: Perfil; catalogo: Catalogo }) {
  const rotuloObjetivo = catalogo.goals.find((g) => g.value === perfil.goal)?.label ?? "";
  const rotuloAtividade = catalogo.activityLevels.find((a) => a.value === perfil.activityLevel)?.label ?? "";
  const alergia = perfil.restrictions.find((r) => r.isAllergy);
  const restricao = alergia?.label ?? perfil.restrictions[0]?.label ?? perfil.otherRestrictions[0] ?? "Nenhuma restrição";
  const dias = perfil.trainingDays.map((d) => DIAS_CURTOS[d]).join(", ") || "sem dias marcados";
  const cozinha = perfil.pantryItems.length;

  const itens = [
    { href: "/onboarding/dados?editar=1", titulo: "Dados pessoais", valor: `${perfil.age} anos, ${metros(perfil.heightCm)}, ${peso(perfil.currentWeightKg)}` },
    { href: "/perfil/preferencias", titulo: "Preferências alimentares", valor: `${cozinha} ${cozinha === 1 ? "alimento" : "alimentos"} na sua cozinha` },
    { href: "/perfil/preferencias", titulo: "Restrições e alergias", valor: restricao, alerta: Boolean(alergia) },
    { href: "/onboarding/rotina?editar=1", titulo: "Rotina e horários", valor: `Treino às ${perfil.trainingTime}, ${dias}` },
    // Resumo das notificações ligadas: Plano 07 (GET /settings).
    { href: "/perfil/configuracoes", titulo: "Notificações e conta", valor: "Avisos, medidas e conta" },
  ];

  return (
    <Screen>
      <header className="flex shrink-0 items-center gap-3.5 px-5 pt-[22px] pb-3.5 area-segura-cima">
        <span
          aria-hidden="true"
          className="flex size-[58px] shrink-0 animate-pop items-center justify-center rounded-full bg-tinta text-[19px] font-semibold text-neve"
        >
          {iniciais(perfil.name)}
        </span>
        <div className="flex-1 animate-entra" style={{ animationDelay: "90ms" }}>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.02em]">{perfil.name}</h1>
          <p className="mt-0.5 text-[13px] text-fumo">No Prato Forte desde {desdeQuando(perfil.createdAt)}</p>
        </div>
        <Link
          href="/perfil/configuracoes"
          aria-label="Abrir configurações"
          className="group flex size-[42px] shrink-0 animate-entra items-center justify-center rounded-full border border-linha bg-white transition-[border-color] duration-250 hover:border-pedra"
          style={{ animationDelay: "160ms" }}
        >
          <IconeAjustes size={20} className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:rotate-90" />
        </Link>
      </header>

      <main className="flex-1 px-5">
        <GoalCard
          objetivo={perfil.goal}
          rotuloObjetivo={rotuloObjetivo}
          inicioKg={perfil.startWeightKg}
          atualKg={perfil.currentWeightKg}
          metaKg={perfil.goalWeightKg}
          origemMeta={perfil.goalWeightSource}
          rotuloAtividade={rotuloAtividade}
          academia={perfil.gym}
          cidade={perfil.city}
        />

        <nav aria-label="Seu perfil" className="mt-4 rounded-[20px] bg-white px-[18px]">
          {itens.map((item, i) => (
            <Link
              key={item.titulo}
              href={item.href}
              style={cascata(i, 60, 320)}
              className={`group flex min-h-15 animate-entra items-center gap-3.5 py-3 transition-colors duration-200 hover:text-mata ${
                i < itens.length - 1 ? "border-b border-fio" : ""
              }`}
            >
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">{item.titulo}</span>
                <span className={`mt-0.5 block text-[13px] ${item.alerta ? "text-alerta" : "text-fumo"}`}>{item.valor}</span>
              </span>
              <IconeAvancar
                size={18}
                className="shrink-0 text-fumo transition-[color,transform] duration-250 group-hover:translate-x-1 group-hover:text-tinta"
              />
            </Link>
          ))}
        </nav>

        <RefazerPlano />
      </main>

      <div className="h-4 shrink-0" />
      <BottomNav />
    </Screen>
  );
}
