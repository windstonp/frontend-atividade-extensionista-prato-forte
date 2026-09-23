"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EtiquetaAlergia, OptionRow } from "@/components/ui/OptionRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconeMais } from "@/components/icons";
import { usePlan } from "@/lib/plan-store";

const RESTRICOES = [
  { id: "castanhas", rotulo: "Amendoim e castanhas", alergia: true },
  { id: "lactose", rotulo: "Intolerância a lactose", alergia: false },
  { id: "gluten", rotulo: "Glúten", alergia: false },
  { id: "frutos-do-mar", rotulo: "Frutos do mar", alergia: true },
];

const COZINHA = [
  "Ovos", "Frango", "Carne moída", "Peixe", "Iogurte", "Queijo",
  "Arroz e feijão", "Batata-doce", "Tapioca", "Macarrão", "Pão francês",
  "Aveia", "Banana", "Mamão",
];

const NAO_CURTE = ["Fígado", "Jiló", "Beterraba", "Peixe", "Berinjela"];

export default function Preferencias() {
  const router = useRouter();
  const { carregando, profile } = usePlan();

  const [restricoes, setRestricoes] = useState<string[] | null>(null);
  const [cozinha, setCozinha] = useState<string[] | null>(null);
  const [naoCurte, setNaoCurte] = useState<string[] | null>(null);

  if (carregando || !profile) {
    return (
      <Screen>
        <TopBar voltarPara="/perfil" rotuloVoltar="Voltar para o perfil" />
        <main className="flex-1 px-5 pt-2">
          <Skeleton className="h-16" />
          <Skeleton className="mt-6 h-[240px] rounded-3xl" />
        </main>
      </Screen>
    );
  }

  const marcadasRestricoes = restricoes ?? profile.restrictions.map((r) => r.id);
  const marcadasCozinha = cozinha ?? profile.pantry;
  const marcadasNaoCurte = naoCurte ?? profile.dislikes;

  const alternar = (
    lista: string[],
    set: (v: string[]) => void,
    item: string,
  ) => set(lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item]);

  return (
    <Screen>
      <TopBar voltarPara="/perfil" rotuloVoltar="Voltar para o perfil" />

      <main className="flex-1 px-5 pt-1.5">
        <h1 className="font-display text-[28px] leading-tight font-bold tracking-[-0.028em]">
          Preferências e restrições
        </h1>
        <p className="mt-2 text-sm leading-normal text-fumo">
          Tudo aqui entra no plano da semana que vem e em toda sugestão do Nutri.
        </p>

        <h2 className="mt-[22px] text-[12.5px] font-semibold text-fumo">
          O que você não pode comer
        </h2>
        <div className="mt-2.5 flex flex-col gap-2">
          {RESTRICOES.map((r) => (
            <OptionRow
              key={r.id}
              quadrado
              compacto
              marcado={marcadasRestricoes.includes(r.id)}
              onClick={() => alternar(marcadasRestricoes, setRestricoes, r.id)}
              titulo={r.rotulo}
              etiqueta={r.alergia ? <EtiquetaAlergia /> : undefined}
            />
          ))}
          <button
            type="button"
            className="flex min-h-13 w-full items-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-[#c3ccc0] px-4 text-sm font-semibold text-fumo transition hover:border-tinta hover:text-tinta"
          >
            <IconeMais size={18} />
            Adicionar outro alimento
          </button>
        </div>

        <h2 className="mt-6 text-[12.5px] font-semibold text-fumo">
          O que costuma ter na sua cozinha
        </h2>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {COZINHA.map((item) => (
            <Chip
              key={item}
              marcado={marcadasCozinha.includes(item)}
              onClick={() => alternar(marcadasCozinha, setCozinha, item)}
            >
              {item}
            </Chip>
          ))}
        </div>

        <h2 className="mt-6 text-[12.5px] font-semibold text-fumo">
          O que você prefere não ver no cardápio
        </h2>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {NAO_CURTE.map((item) => (
            <Chip
              key={item}
              marcado={marcadasNaoCurte.includes(item)}
              onClick={() => alternar(marcadasNaoCurte, setNaoCurte, item)}
            >
              {item}
            </Chip>
          ))}
        </div>

        <p className="mt-5 text-[12.5px] leading-normal text-fumo">
          Alergias nunca aparecem, nem em substituições. Os alimentos que você só não
          gosta podem voltar a ser sugeridos de vez em quando.
        </p>
      </main>

      <footer className="shrink-0 px-5 pt-3.5 pb-7 area-segura-baixo">
        <Button onClick={() => router.push("/perfil")}>Salvar alterações</Button>
      </footer>
    </Screen>
  );
}
