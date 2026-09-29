"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorState } from "@/components/app/ErrorState";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { IconeMais } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Chip, ChipRemovivel } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { EtiquetaAlergia, OptionRow } from "@/components/ui/OptionRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toaster";
import { useCatalogo } from "@/features/onboarding/hooks";
import { MENSAGENS } from "@/features/onboarding/regras";
import type { Catalogo } from "@/features/onboarding/tipos";
import { type ApiError, comoApiError } from "@/lib/api/errors";
import { cascata } from "@/lib/motion";
import { usePerfil, useSalvarPreferencias } from "../hooks";
import type { EntradaPreferencias, Perfil } from "../tipos";

/** S18 — restrições, cozinha e "prefiro não ver", salvos juntos (RF17). */
export function PreferenciasTela() {
  const perfil = usePerfil();
  const catalogo = useCatalogo();

  return (
    <Screen>
      <TopBar voltarPara="/perfil" rotuloVoltar="Voltar para o perfil" />
      {perfil.error || catalogo.error ? (
        <main className="flex-1">
          <ErrorState
            titulo="Não foi possível carregar suas preferências"
            descricao="Confira a internet e tente de novo."
            aoTentarDeNovo={() => {
              void perfil.refetch();
              void catalogo.refetch();
            }}
          />
        </main>
      ) : !perfil.data || !catalogo.data ? (
        <main className="flex-1 px-5 pt-2" aria-busy="true" aria-label="Carregando suas preferências">
          <Skeleton className="h-16" />
          <Skeleton className="mt-6 h-[240px] rounded-3xl" atraso={90} />
        </main>
      ) : (
        <FormPreferencias perfil={perfil.data} catalogo={catalogo.data} />
      )}
    </Screen>
  );
}

const iguais = (a: (string | number)[], b: (string | number)[]) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

function FormPreferencias({ perfil, catalogo }: { perfil: Perfil; catalogo: Catalogo }) {
  const router = useRouter();
  const avisar = useToast();
  const salvar = useSalvarPreferencias();
  const [inicial] = useState<EntradaPreferencias>(() => ({
    restrictions: perfil.restrictions.map((r) => r.slug),
    otherRestrictions: perfil.otherRestrictions,
    pantryItems: perfil.pantryItems.map((i) => i.slug),
    dislikedFoodIds: perfil.dislikedFoods.map((f) => f.id),
  }));
  const [escolhas, setEscolhas] = useState<EntradaPreferencias>(inicial);
  const [adicionando, setAdicionando] = useState(false);
  const [novo, setNovo] = useState("");
  const [erroNovo, setErroNovo] = useState<string>();
  const [erro, setErro] = useState<ApiError | null>(null);

  const mudou =
    novo.trim() !== "" ||
    (Object.keys(inicial) as (keyof EntradaPreferencias)[]).some((campo) => !iguais(inicial[campo], escolhas[campo]));

  function alternar<C extends "restrictions" | "pantryItems">(campo: C, slug: string) {
    setEscolhas((atual) => ({
      ...atual,
      [campo]: atual[campo].includes(slug) ? atual[campo].filter((s) => s !== slug) : [...atual[campo], slug],
    }));
  }

  function alternarNaoCurte(id: number) {
    setEscolhas((atual) => ({
      ...atual,
      dislikedFoodIds: atual.dislikedFoodIds.includes(id) ? atual.dislikedFoodIds.filter((x) => x !== id) : [...atual.dislikedFoodIds, id],
    }));
  }

  /** Mensagem de erro do item digitado em "Outro alimento", ou nada se ele pode entrar. */
  function problemaDoOutro(item: string): string | undefined {
    const repetido = escolhas.otherRestrictions.some((o) => o.toLocaleLowerCase("pt-BR") === item.toLocaleLowerCase("pt-BR"));
    if ([...item].length < 2 || [...item].length > 60) return MENSAGENS.outraTamanho;
    if (repetido) return "Esse item já está na lista.";
    if (escolhas.otherRestrictions.length >= 10) return MENSAGENS.outrasMuitas;
    return undefined;
  }

  function adicionarOutro() {
    const item = novo.trim();
    const problema = problemaDoOutro(item);
    setErroNovo(problema);
    if (problema) return;
    setEscolhas((atual) => ({ ...atual, otherRestrictions: [...atual.otherRestrictions, item] }));
    setNovo("");
    setAdicionando(false);
  }

  async function enviar() {
    setErro(null);
    // Restrição digitada e não confirmada em "Adicionar" entra também: perder uma alergia em silêncio é pior (RN17).
    const pendente = novo.trim();
    if (pendente) {
      const problema = problemaDoOutro(pendente);
      setErroNovo(problema);
      if (problema) return;
    }
    try {
      await salvar.mutateAsync({
        restrictions: catalogo.restrictions.map((r) => r.slug).filter((s) => escolhas.restrictions.includes(s)),
        otherRestrictions: pendente ? [...escolhas.otherRestrictions, pendente] : escolhas.otherRestrictions,
        pantryItems: catalogo.pantry.flatMap((g) => g.items.map((i) => i.slug)).filter((s) => escolhas.pantryItems.includes(s)),
        dislikedFoodIds: catalogo.dislikeOptions.map((d) => d.id).filter((id) => escolhas.dislikedFoodIds.includes(id)),
      });
    } catch (e) {
      setErro(comoApiError(e));
      return;
    }
    // Com o plano alimentar (Plano 04), restrição nova refaz o plano (RN21); até lá, só salva.
    avisar({ texto: "Salvo." });
    router.push("/perfil");
  }

  return (
    <>
      <main className="flex-1 px-5 pt-1.5">
        <h1 className="animate-entra font-display text-[28px] leading-tight font-bold tracking-[-0.028em]">Preferências e restrições</h1>
        <p className="mt-2 animate-entra text-sm leading-normal text-fumo" style={{ animationDelay: "80ms" }}>
          Restrições e alergias refazem seu plano na hora. O resto entra quando você refizer o plano.
        </p>

        <h2 className="mt-[22px] text-[12.5px] font-semibold text-fumo">O que você não pode comer</h2>
        <div className="mt-2.5 flex flex-col gap-2">
          {catalogo.restrictions.map((r, i) => (
            <OptionRow
              key={r.slug}
              className="animate-entra"
              style={cascata(i, 45, 140)}
              quadrado
              compacto
              marcado={escolhas.restrictions.includes(r.slug)}
              onClick={() => alternar("restrictions", r.slug)}
              titulo={r.label}
              etiqueta={r.isAllergy ? <EtiquetaAlergia /> : undefined}
            />
          ))}
        </div>
        {escolhas.otherRestrictions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {escolhas.otherRestrictions.map((item) => (
              <ChipRemovivel
                key={item}
                className="animate-escala"
                aoRemover={() => setEscolhas((atual) => ({ ...atual, otherRestrictions: atual.otherRestrictions.filter((o) => o !== item) }))}
              >
                {item}
              </ChipRemovivel>
            ))}
          </div>
        ) : null}
        {adicionando ? (
          <div className="mt-3 flex animate-entra items-start gap-2">
            <Field
              id="novo-alimento"
              label="Outro alimento"
              className="flex-1"
              autoFocus
              value={novo}
              placeholder="Ex.: pimenta"
              onChange={(e) => {
                setNovo(e.target.value);
                setErroNovo(undefined);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  adicionarOutro();
                }
              }}
              erro={erroNovo}
            />
            <Button tamanho="media" variante="contorno" className="mt-[26px] h-[52px]" onClick={adicionarOutro}>
              Adicionar
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            className="mt-2 flex min-h-13 w-full items-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-pedra px-4 text-sm font-semibold text-fumo transition hover:border-tinta hover:text-tinta"
          >
            <IconeMais size={18} />
            Adicionar outro alimento
          </button>
        )}

        <h2 className="mt-6 text-[12.5px] font-semibold text-fumo">O que costuma ter na sua cozinha</h2>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {catalogo.pantry.flatMap((g) => g.items).map((item) => (
            <Chip key={item.slug} marcado={escolhas.pantryItems.includes(item.slug)} onClick={() => alternar("pantryItems", item.slug)}>
              {item.label}
            </Chip>
          ))}
        </div>

        <h2 className="mt-6 text-[12.5px] font-semibold text-fumo">O que você prefere não ver no cardápio</h2>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {catalogo.dislikeOptions.map((opcao) => (
            <Chip key={opcao.id} marcado={escolhas.dislikedFoodIds.includes(opcao.id)} onClick={() => alternarNaoCurte(opcao.id)}>
              {opcao.name}
            </Chip>
          ))}
        </div>

        <p className="mt-5 text-[12.5px] leading-normal text-fumo">Alergias nunca aparecem, nem em substituições.</p>
      </main>

      <footer className="shrink-0 px-5 pt-3.5 pb-7 area-segura-baixo">
        <FormError erro={erro} />
        <Button carregando={salvar.isPending} rotuloCarregando="Salvando…" disabled={!mudou} onClick={() => void enviar()}>
          Salvar alterações
        </Button>
      </footer>
    </>
  );
}
