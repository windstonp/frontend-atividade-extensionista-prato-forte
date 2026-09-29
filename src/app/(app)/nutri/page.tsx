"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  IconeAvancar,
  IconeEnviar,
  IconeRecomecar,
  IconeSemConexao,
  IconeSeta,
  MarcaNutri,
} from "@/components/icons";
import { askNutri, buildNutriContext, getSubstitutions } from "@/lib/mock-api";
import { mockSuggestions } from "@/mocks/fixtures/mock-data";
import { gramas, kcal } from "@/lib/format";
import { usePlan, useResumoDoDia } from "@/lib/plan-store";
import type { NutriAction, NutriMessage } from "@/lib/types";
import { cascata } from "@/lib/motion";

export default function Nutri() {
  const { carregando, plan, profile, substituirAlimento, aplicarRefeicao } = usePlan();
  const resumo = useResumoDoDia();

  const [mensagens, setMensagens] = useState<NutriMessage[]>([]);
  const [rascunho, setRascunho] = useState("");
  const [pensando, setPensando] = useState(false);
  const [offline, setOffline] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens, pensando]);

  async function perguntar(texto: string) {
    const pergunta = texto.trim();
    if (!pergunta || pensando) return;

    setRascunho("");
    const minha: NutriMessage = {
      id: `eu-${Date.now()}`,
      role: "user",
      content: pergunta,
    };

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setOffline(true);
      setMensagens((m) => [...m, { ...minha, status: "falhou" }]);
      return;
    }

    setOffline(false);
    setMensagens((m) => [...m, minha]);
    setPensando(true);
    try {
      const resposta = await askNutri(pergunta);
      setMensagens((m) => [...m, resposta]);
    } catch {
      setOffline(true);
      setMensagens((m) =>
        m.map((msg) => (msg.id === minha.id ? { ...msg, status: "falhou" } : msg)),
      );
    } finally {
      setPensando(false);
    }
  }

  function reenviar(id: string) {
    const msg = mensagens.find((m) => m.id === id);
    if (!msg) return;
    setMensagens((m) => m.filter((x) => x.id !== id));
    void perguntar(msg.content);
  }

  async function executar(acao: NutriAction, mensagemId: string) {
    if (acao.kind === "substituir") {
      const opcoes = await getSubstitutions(acao.foodId);
      const escolhida = opcoes.find((o) => o.id === acao.substitutionId) ?? opcoes[0];
      if (escolhida) substituirAlimento(acao.mealId, acao.foodId, escolhida);
      confirmar(mensagemId, `Feito. Seu almoço de hoje vai com ${escolhida?.name.toLowerCase()}.`);
    }
    if (acao.kind === "aplicar-refeicao") {
      const msg = mensagens.find((m) => m.id === mensagemId);
      if (msg?.meal) aplicarRefeicao(acao.mealId, msg.meal);
      confirmar(mensagemId, `Pronto. Seu jantar de hoje foi atualizado.`);
    }
    if (acao.kind === "outra-opcao") {
      const msg = mensagens.find((m) => m.id === mensagemId);
      void perguntar(msg?.meal ? "Monte outra opção de jantar" : "Quero ver outras opções");
    }
    if (acao.kind === "dispensar") {
      setMensagens((m) =>
        m.map((x) => (x.id === mensagemId ? { ...x, actions: undefined } : x)),
      );
    }
  }

  function confirmar(mensagemId: string, texto: string) {
    setMensagens((m) => [
      ...m.map((x) => (x.id === mensagemId ? { ...x, actions: undefined } : x)),
      {
        id: `ok-${Date.now()}`,
        role: "assistant",
        content: texto,
        actions: [{ kind: "ver-refeicao", mealId: "almoco", label: "Ver a refeição" }],
      },
    ]);
  }

  const contexto =
    plan && profile && resumo
      ? buildNutriContext(plan, profile, resumo.caloriasRestantes, resumo.proteinaRestante)
      : null;
  const proxima = plan?.meals.find((m) => !m.done);
  const vazio = mensagens.length === 0;

  return (
    <Screen>
      <TopBar
        voltarPara="/hoje"
        rotuloVoltar="Voltar para hoje"
        className={vazio ? "" : "border-b border-linha pb-3"}
        direita={
          <div className="flex flex-1 items-center gap-3 pl-1">
            <MarcaNutri size={34} apagada={offline} />
            <div className="flex-1">
              <p className="font-display text-[19px] font-bold tracking-[-0.02em]">Nutri</p>
              <p
                className={`text-xs ${offline ? "font-medium text-alerta" : "text-fumo"}`}
              >
                {offline
                  ? "Sem conexão"
                  : proxima
                    ? `Olhando seu ${proxima.name.toLowerCase()} de hoje`
                    : "Conhece seu plano e suas restrições"}
              </p>
            </div>
          </div>
        }
      />

      <main className="flex-1 px-5 pt-4">
        {offline ? (
          <div className="mb-4 flex animate-entra-topo items-start gap-3 rounded-2xl bg-alerta-fraca p-4">
            <IconeSemConexao size={20} className="mt-0.5 shrink-0 text-alerta" />
            <div>
              <p className="text-[14.5px] font-semibold text-alerta-texto">
                Sua pergunta não saiu daqui
              </p>
              <p className="mt-1 text-[13px] leading-snug text-alerta-texto">
                O aparelho está sem internet. Seu plano de hoje continua salvo: dá para
                ver as refeições e marcar o que comeu.
              </p>
              <Link
                href="/dieta"
                className="mt-2.5 inline-flex h-9 items-center rounded-full border-[1.5px] border-alerta-texto px-3.5 text-[13px] font-semibold text-alerta-texto"
              >
                Ver as refeições de hoje
              </Link>
            </div>
          </div>
        ) : null}

        {vazio ? (
          <EstadoInicial
            carregando={carregando}
            nome={profile?.name.split(" ")[0]}
            contextoLinhas={contexto?.lines ?? []}
            aoEscolher={perguntar}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {mensagens.map((msg) =>
              msg.role === "user" ? (
                <Pergunta key={msg.id} msg={msg} aoReenviar={() => reenviar(msg.id)} />
              ) : (
                <Resposta key={msg.id} msg={msg} aoAgir={(a) => void executar(a, msg.id)} />
              ),
            )}
            {pensando ? <Pensando /> : null}
          </div>
        )}
        <div ref={fim} />
      </main>

      {!vazio && !pensando ? (
        <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-1">
          {["E no jantar?", "Por que mais fibra?", "O que como antes do treino?"].map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => void perguntar(s)}
              style={cascata(i, 70, 120)}
              className="h-9 shrink-0 animate-escala rounded-full border border-linha bg-white px-3.5 text-[13px] font-medium whitespace-nowrap transition-[border-color,transform] duration-250 hover:-translate-y-px hover:border-pedra active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void perguntar(rascunho);
        }}
        className="flex shrink-0 items-center gap-2.5 border-t border-linha px-4 pt-3 pb-5 area-segura-baixo"
      >
        <label htmlFor="pergunta" className="sr-only">
          Escreva sua pergunta para o Nutri
        </label>
        <input
          id="pergunta"
          value={rascunho}
          onChange={(e) => setRascunho(e.target.value)}
          placeholder="Escreva sua pergunta"
          className="h-[50px] flex-1 rounded-full border border-linha bg-white px-4 text-[14.5px] transition placeholder:text-musgo focus:border-tinta focus:shadow-[inset_0_0_0_1px_var(--color-tinta)] focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Enviar pergunta"
          disabled={!rascunho.trim() || pensando}
          className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-tinta text-neve transition disabled:opacity-40"
        >
          <IconeEnviar size={20} />
        </button>
      </form>
    </Screen>
  );
}

function EstadoInicial({
  carregando,
  nome,
  contextoLinhas,
  aoEscolher,
}: {
  carregando: boolean;
  nome?: string;
  contextoLinhas: { text: string; tone: "gema" | "alerta" | "mata" }[];
  aoEscolher: (q: string) => void;
}) {
  const cor = { gema: "bg-gema", alerta: "bg-alerta", mata: "bg-mata" };

  return (
    <>
      <h1 className="animate-entra font-display text-[27px] leading-tight font-bold tracking-[-0.028em]">
        No que posso ajudar{nome ? `, ${nome}` : ""}?
      </h1>
      <p
        className="mt-2 animate-entra text-sm leading-normal text-fumo"
        style={{ animationDelay: "90ms" }}
      >
        Pergunte como se estivesse falando com a nutricionista da academia.
      </p>

      <section
        className="mt-[18px] animate-escala rounded-[18px] bg-white px-4 pt-1 pb-2"
        style={{ animationDelay: "160ms" }}
      >
        <p className="py-3 text-[12.5px] font-semibold text-fumo">
          O que estou olhando agora
        </p>
        {carregando ? (
          <div className="flex flex-col gap-2 pb-2">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : (
          contextoLinhas.map((linha, i) => (
            <div
              key={linha.text}
              style={cascata(i, 70, 260)}
              className={`flex animate-entra-lado-esq items-start gap-2.5 py-[9px] ${
                i < contextoLinhas.length - 1 ? "border-b border-fio" : ""
              }`}
            >
              <span
                className={`mt-1.5 size-1.5 shrink-0 animate-pop rounded-full ${cor[linha.tone]}`}
                style={cascata(i, 70, 300)}
              />
              <span className="text-[13.5px] leading-snug first-letter:uppercase">
                {linha.text}
              </span>
            </div>
          ))
        )}
      </section>

      <h2
        className="mt-5 animate-entra font-display text-[15px] font-semibold"
        style={{ animationDelay: "420ms" }}
      >
        Perguntas que cabem agora
      </h2>
      <div className="mt-2.5 flex flex-col gap-2">
        {mockSuggestions.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => aoEscolher(s.question)}
            style={cascata(i, 80, 480)}
            className="group flex min-h-15 animate-entra items-center gap-3 rounded-2xl border border-linha bg-white py-3.5 pr-3.5 pl-4 text-left transition-[border-color,box-shadow,transform] duration-250 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-tinta hover:shadow-[0_12px_28px_-20px_rgba(21,37,28,.9)] active:scale-[0.99]"
          >
            <span className="flex-1 text-[14.5px] leading-snug font-medium">
              {s.question}
            </span>
            <IconeAvancar
              size={18}
              className="shrink-0 text-fumo transition-transform duration-250 group-hover:translate-x-1"
            />
          </button>
        ))}
      </div>
    </>
  );
}

function Pergunta({ msg, aoReenviar }: { msg: NutriMessage; aoReenviar: () => void }) {
  const falhou = msg.status === "falhou";
  return (
    <div className="flex animate-entra-lado flex-col items-end">
      <p
        className={`max-w-[264px] rounded-[18px] rounded-br-md px-[15px] py-3 text-[14.5px] leading-snug ${
          falhou ? "border border-linha bg-white text-fumo" : "bg-tinta text-neve"
        }`}
      >
        {msg.content}
      </p>
      {falhou ? (
        <div className="mt-2 flex animate-balanca items-center gap-2.5">
          <span className="text-xs font-medium text-alerta">Não enviada</span>
          <button
            type="button"
            onClick={aoReenviar}
            className="flex h-9 items-center gap-[7px] rounded-full border-[1.5px] border-tinta px-3.5 text-[13px] font-semibold"
          >
            <IconeRecomecar size={15} strokeWidth={2} />
            Tentar de novo
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Pensando() {
  return (
    <div className="flex animate-entra gap-2.5">
      <span className="animate-respira">
        <MarcaNutri size={26} />
      </span>
      <div className="flex flex-1 items-center gap-1.5 pt-1.5" aria-live="polite">
        <span className="sr-only">O Nutri está montando a resposta</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-pedra motion-safe:animate-bounce"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function Resposta({
  msg,
  aoAgir,
}: {
  msg: NutriMessage;
  aoAgir: (acao: NutriAction) => void;
}) {
  return (
    <div className="flex animate-entra-lado-esq gap-2.5">
      <span className="animate-pop">
        <MarcaNutri size={26} />
      </span>
      <div className="flex-1">
        <p className="animate-entra text-[14.5px] leading-relaxed">{msg.content}</p>

        {msg.swap ? (
          <div
            className="mt-3 animate-escala rounded-[18px] bg-white px-4 py-3.5"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex-1">
                <p className="text-[13.5px] font-semibold">{msg.swap.fromName}</p>
                <p className="mt-0.5 text-xs text-fumo">
                  {msg.swap.fromAmount}, {kcal(msg.swap.fromCalories)}
                </p>
              </div>
              <IconeSeta
                size={20}
                className="shrink-0 animate-entra-lado text-fumo"
                style={{ animationDelay: "320ms" }}
              />
              <div className="flex-1 text-right">
                <p className="text-[13.5px] font-semibold">{msg.swap.toName}</p>
                <p className="mt-0.5 text-xs text-fumo">
                  {msg.swap.toAmount}, {kcal(msg.swap.toCalories)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3.5 border-t border-fio pt-3">
              <span className="text-[12.5px] text-fumo">
                Carboidrato{" "}
                <b className="font-semibold text-tinta">
                  {msg.swap.carbsBefore} g para {msg.swap.carbsAfter} g
                </b>
              </span>
              <span className="text-[12.5px] font-semibold text-mata">
                {msg.swap.calorieDelta} kcal no dia
              </span>
            </div>
          </div>
        ) : null}

        {msg.meal ? (
          <div
            className="mt-3 animate-escala rounded-[18px] bg-white px-4 py-3.5"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex items-baseline justify-between">
              <p className="font-display text-[17px] font-bold tracking-[-0.02em]">
                {msg.meal.title}, {msg.meal.time}
              </p>
              <span className="text-[13px] font-semibold">{kcal(msg.meal.calories)}</span>
            </div>
            <ul className="mt-2 list-none">
              {msg.meal.items.map((item, i) => (
                <li
                  key={item.name}
                  style={cascata(i, 90, 320)}
                  className={`flex animate-entra-lado-esq items-baseline gap-2.5 py-2.5 ${
                    i < msg.meal!.items.length - 1 ? "border-b border-fio" : ""
                  }`}
                >
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  <span className="text-[12.5px] text-fumo">{item.amount}</span>
                  <span className="w-[58px] text-right text-[12.5px] font-semibold">
                    {kcal(item.calories)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-3.5 border-t border-fio pt-3">
              <span className="text-[12.5px] text-fumo">
                {gramas(msg.meal.macros.protein)}{" "}
                <b className="font-semibold text-tinta">proteína</b>
              </span>
              <span className="text-[12.5px] text-fumo">
                {gramas(msg.meal.macros.carbs)} <b className="font-semibold text-tinta">carbo</b>
              </span>
              <span className="text-[12.5px] text-fumo">
                {gramas(msg.meal.macros.fat)} <b className="font-semibold text-tinta">gordura</b>
              </span>
            </div>
          </div>
        ) : null}

        {msg.meal?.warning ? (
          <div
            className="mt-3 flex animate-entra items-start gap-2.5 rounded-[14px] bg-gema-fraca px-3.5 py-3"
            style={{ animationDelay: "560ms" }}
          >
            <span className="mt-1.5 size-1.5 shrink-0 animate-respira rounded-full bg-gema" />
            <span className="text-[12.5px] leading-snug text-gema-texto">
              {msg.meal.warning}
            </span>
          </div>
        ) : null}

        {msg.followUp ? (
          <p
            className="mt-3 animate-entra text-[14.5px] leading-relaxed"
            style={{ animationDelay: "420ms" }}
          >
            {msg.followUp}
          </p>
        ) : null}

        {msg.actions?.length ? (
          <div className="mt-3.5 flex flex-col gap-2">
            {msg.actions.map((acao, i) =>
              acao.kind === "ver-refeicao" ? (
                <Link
                  key={acao.label}
                  href={`/dieta/${acao.mealId}`}
                  style={cascata(i, 70, 620)}
                  className="flex h-11 animate-entra items-center justify-center gap-2 rounded-full border-[1.5px] border-linha text-sm font-semibold transition-[border-color,transform] duration-250 hover:-translate-y-px hover:border-tinta active:scale-95"
                >
                  {acao.label}
                </Link>
              ) : acao.kind === "substituir" || acao.kind === "aplicar-refeicao" ? (
                <button
                  key={acao.label}
                  type="button"
                  onClick={() => aoAgir(acao)}
                  style={cascata(i, 70, 620)}
                  className="flex h-11 animate-entra items-center justify-center rounded-full bg-gema text-sm font-semibold text-tinta shadow-[0_1px_2px_rgba(21,37,28,.08)] transition-[filter,transform,box-shadow] duration-250 hover:-translate-y-px hover:brightness-[.97] hover:shadow-[0_10px_22px_-12px_rgba(21,37,28,.6)] active:scale-[0.97]"
                >
                  {acao.label}
                </button>
              ) : (
                <button
                  key={acao.label}
                  type="button"
                  onClick={() => aoAgir(acao)}
                  style={cascata(i, 70, 620)}
                  className="group flex h-11 animate-entra items-center justify-center gap-2 rounded-full border-[1.5px] border-linha text-sm font-semibold transition-[border-color,transform] duration-250 hover:-translate-y-px hover:border-tinta active:scale-95"
                >
                  {acao.kind === "outra-opcao" ? (
                    <IconeRecomecar
                      size={16}
                      className="transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:rotate-180"
                    />
                  ) : null}
                  {acao.label}
                </button>
              ),
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
