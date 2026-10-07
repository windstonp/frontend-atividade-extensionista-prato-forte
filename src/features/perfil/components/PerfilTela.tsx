"use client";

import { useStatusUsabilidade } from "@/features/validacao/hooks";
import { BottomNav } from "@/components/app/BottomNav";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCatalogo } from "@/features/onboarding/hooks";
import { DIAS_CURTOS } from "@/lib/labels";
import { useMedidas } from "@/lib/useMedidas";
import { desdeQuando } from "../formato";
import { usePerfil } from "../hooks";
import type { Perfil } from "../tipos";
import type { Catalogo } from "@/features/onboarding/tipos";
import { GoalCard } from "./GoalCard";
import { ProfileHeader } from "./ProfileHeader";
import { type ItemDoPerfil, ProfileMenu } from "./ProfileMenu";
import { RefazerPlano } from "./RefazerPlano";
import { useConfiguracoes } from "@/features/configuracoes/hooks";
import { resumoDosAvisos } from "@/features/configuracoes/regras";

/** S17 — Perfil vindo de `GET /profile`; os rótulos vêm do catálogo. */
export function PerfilTela() {
  const perfil = usePerfil();
  const catalogo = useCatalogo();

  if (perfil.error || catalogo.error) {
    return (
      <Screen>
        <main className="flex-1 pt-seguro-6">
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
        <main className="flex-1 px-5 pt-seguro-6" aria-busy="true" aria-label="Carregando seu perfil">
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
  const m = useMedidas();
  const usabilidade = useStatusUsabilidade();
  const configuracoes = useConfiguracoes();
  const rotuloObjetivo = catalogo.goals.find((g) => g.value === perfil.goal)?.label ?? "";
  const rotuloAtividade = catalogo.activityLevels.find((a) => a.value === perfil.activityLevel)?.label ?? "";
  const alergia = perfil.restrictions.find((r) => r.isAllergy);
  const restricao = alergia?.label ?? perfil.restrictions[0]?.label ?? perfil.otherRestrictions[0] ?? "Nenhuma restrição";
  const dias = perfil.trainingDays.map((d) => DIAS_CURTOS[d]).join(", ") || "sem dias marcados";
  const cozinha = perfil.pantryItems.length;

  const itens: ItemDoPerfil[] = [
    { href: "/onboarding/dados?editar=1", titulo: "Dados pessoais", valor: `${perfil.age} anos, ${m.altura(perfil.heightCm)}, ${m.peso(perfil.currentWeightKg)}` },
    { href: "/perfil/preferencias", titulo: "Preferências alimentares", valor: `${cozinha} ${cozinha === 1 ? "alimento" : "alimentos"} na sua cozinha` },
    { href: "/perfil/preferencias", titulo: "Restrições e alergias", valor: restricao, alerta: Boolean(alergia) },
    { href: "/onboarding/rotina?editar=1", titulo: "Rotina e horários", valor: `Treino às ${perfil.trainingTime}, ${dias}` },
    usabilidade.data?.responded
      ? { href: "", titulo: "Avaliar o app", valor: "Obrigado por avaliar!", desabilitado: true }
      : { href: "/perfil/avaliar", titulo: "Avaliar o app", valor: "Responda umas perguntas rápidas" },
    {
      href: "/perfil/configuracoes",
      titulo: "Notificações e conta",
      valor: configuracoes.data ? resumoDosAvisos(configuracoes.data.notifications) : "Avisos, medidas e conta",
    },
  ];

  return (
    <Screen>
      <ProfileHeader nome={perfil.name} desde={desdeQuando(perfil.createdAt)} />

      <main className="flex-1 px-5">
        <GoalCard
          medidas={m}
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

        <ProfileMenu itens={itens} />

        <RefazerPlano />
      </main>

      <div className="h-4 shrink-0" />
      <BottomNav />
    </Screen>
  );
}
