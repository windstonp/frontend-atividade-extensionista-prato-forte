"use client";

import Link from "next/link";
import { BottomNav } from "@/components/app/BottomNav";
import { NutriBar } from "@/components/app/NutriBar";
import { Screen } from "@/components/app/Screen";
import { ReguaPeso } from "@/components/ui/Rail";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconeAjustes, IconeAvancar } from "@/components/icons";
import { peso } from "@/lib/format";
import { ATIVIDADES, DIAS_CURTOS, OBJETIVOS } from "@/lib/labels";
import { usePlan } from "@/lib/plan-store";
import { cascata } from "@/lib/motion";

export default function Perfil() {
  const { carregando, profile } = usePlan();

  if (carregando || !profile) {
    return (
      <Screen>
        <main className="flex-1 px-5 pt-6">
          <Skeleton className="h-16" />
          <Skeleton className="mt-4 h-[200px] rounded-3xl" />
          <Skeleton className="mt-4 h-[320px] rounded-3xl" />
        </main>
        <BottomNav />
      </Screen>
    );
  }

  const alergia = profile.restrictions.find((r) => r.allergy);
  const dias = profile.trainingDays.map((d) => DIAS_CURTOS[d]).join(", ");

  const itens = [
    {
      href: "/onboarding/dados",
      titulo: "Dados pessoais",
      valor: `${profile.age} anos, ${(profile.heightCm / 100).toFixed(2).replace(".", ",")} m, ${peso(profile.weightKg)}`,
    },
    {
      href: "/perfil/preferencias",
      titulo: "Preferências alimentares",
      valor: `${profile.pantry.length} alimentos na sua cozinha`,
    },
    {
      href: "/perfil/preferencias",
      titulo: "Restrições e alergias",
      valor: alergia ? alergia.label : "Nenhuma restrição",
      alerta: Boolean(alergia),
    },
    {
      href: "/onboarding/rotina",
      titulo: "Rotina e horários",
      valor: `Treino às ${profile.trainingTime}, ${dias}`,
    },
    {
      href: "/perfil/configuracoes",
      titulo: "Notificações e conta",
      valor: "Lembretes de refeição ligados",
    },
  ];

  return (
    <Screen>
      <header className="flex shrink-0 items-center gap-3.5 px-5 pt-[22px] pb-3.5 area-segura-cima">
        <span className="flex size-[58px] shrink-0 animate-pop items-center justify-center rounded-full bg-tinta text-[19px] font-semibold text-neve">
          {profile.initials}
        </span>
        <div className="flex-1 animate-entra" style={{ animationDelay: "90ms" }}>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.02em]">
            {profile.name}
          </h1>
          <p className="mt-0.5 text-[13px] text-fumo">
            Treina na {profile.gym} desde {profile.memberSince}
          </p>
        </div>
        <Link
          href="/perfil/configuracoes"
          aria-label="Abrir configurações"
          className="group flex size-[42px] shrink-0 animate-entra items-center justify-center rounded-full border border-linha bg-white transition-[border-color] duration-250 hover:border-pedra"
          style={{ animationDelay: "160ms" }}
        >
          <IconeAjustes
            size={20}
            className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:rotate-90"
          />
        </Link>
      </header>

      <main className="flex-1 px-5">
        <section
          className="animate-escala rounded-[22px] bg-tinta p-[18px] text-neve"
          style={{ animationDelay: "180ms" }}
        >
          <p className="text-[12.5px] text-musgo">Seu objetivo</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.025em]">
            {OBJETIVOS[profile.goal]}
          </h2>
          <div className="mt-3.5 flex">
            <ReguaPeso
              escuro
              inicio={profile.startWeightKg}
              atual={profile.weightKg}
              meta={profile.goalWeightKg}
            />
          </div>
          <div className="mt-2 flex justify-between text-[12.5px]">
            <span className="text-salvia">{peso(profile.weightKg)} hoje</span>
            <span className="text-musgo">meta {peso(profile.goalWeightKg)}</span>
          </div>
          <Link
            href="/onboarding/objetivo"
            className="mt-4 flex h-[42px] items-center justify-center rounded-full border-[1.5px] border-grafite text-sm font-semibold text-neve transition hover:bg-neve/10"
          >
            Trocar objetivo
          </Link>
          <p className="mt-3 text-[12.5px] text-musgo">
            {ATIVIDADES[profile.activity]}, na {profile.gym} de {profile.city}
          </p>
        </section>

        <nav className="mt-4 rounded-[20px] bg-white px-[18px]">
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
                <span
                  className={`mt-0.5 block text-[13px] ${
                    item.alerta ? "text-alerta" : "text-fumo"
                  }`}
                >
                  {item.valor}
                </span>
              </span>
              <IconeAvancar
                size={18}
                className="shrink-0 text-musgo transition-[color,transform] duration-250 group-hover:translate-x-1 group-hover:text-tinta"
              />
            </Link>
          ))}
        </nav>

        <NutriBar
          className="mt-3.5 animate-entra"
          style={{ animationDelay: "640ms" }}
          texto="Refazer meu plano com o Nutri"
        />
      </main>

      <div className="h-4 shrink-0" />
      <BottomNav />
    </Screen>
  );
}
