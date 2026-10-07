"use client";

import { useState } from "react";
import { Screen } from "@/components/app/Screen";
import { ButtonLink } from "@/components/ui/Button";
import { OnboardingStep } from "@/features/onboarding/components/OnboardingStep";
import { comoApiError } from "@/lib/api/errors";
import { useResponderQuestionario } from "../hooks";
import { AFIRMACOES_SUS, ESCALA_SUS, ESCALA_UTILIDADE, TOTAL_DE_TELAS } from "../perguntas";
import { LikertQuestion } from "./LikertQuestion";

/** N08 — uma pergunta por tela, respostas só no aparelho até o envio (RF32). */
export function QuestionarioTela() {
  const responder = useResponderQuestionario();
  const [tela, setTela] = useState(1);
  const [sus, setSus] = useState<(number | null)[]>(() => Array(10).fill(null));
  const [utilidade, setUtilidade] = useState<number | null>(null);
  const [ajudou, setAjudou] = useState("");
  const [atrapalhou, setAtrapalhou] = useState("");
  const [obrigado, setObrigado] = useState(false);

  const erro = responder.error ? comoApiError(responder.error) : null;
  if (obrigado || erro?.code === "ALREADY_RESPONDED") {
    return (
      <Screen>
        <main className="flex flex-1 flex-col items-start justify-center px-6">
          <h1 className="animate-entra font-display text-[30px] leading-tight font-bold tracking-[-0.03em]">Obrigado por avaliar!</h1>
          <p className="mt-3 animate-entra text-[15px] leading-relaxed text-fumo" style={{ animationDelay: "100ms" }}>
            Suas respostas ajudam a ajustar o Prato Forte para quem treina na Zfit.
          </p>
          <ButtonLink href="/hoje" className="mt-6 animate-entra" style={{ animationDelay: "200ms" }}>
            Voltar para o app
          </ButtonLink>
        </main>
      </Screen>
    );
  }

  function enviar() {
    responder.mutate(
      { susAnswers: sus.map((n) => n ?? 3), usefulness: utilidade ?? 3, liked: ajudou.trim() || null, disliked: atrapalhou.trim() || null },
      { onSuccess: () => setObrigado(true) },
    );
  }

  const comum = {
    numero: tela,
    total: TOTAL_DE_TELAS,
    voltarPara: tela === 1 ? "/perfil" : null,
    aoVoltar: tela === 1 ? undefined : () => setTela(tela - 1),
  };

  if (tela <= 10) {
    const i = tela - 1;
    return (
      <OnboardingStep key={tela} {...comum} titulo={AFIRMACOES_SUS[i]} descricao="Quanto você concorda?" podeContinuar={sus[i] !== null} aoContinuar={() => setTela(tela + 1)}>
        <LikertQuestion rotulo={AFIRMACOES_SUS[i]} opcoes={ESCALA_SUS} valor={sus[i]} aoEscolher={(n) => setSus(sus.map((v, j) => (j === i ? n : v)))} />
      </OnboardingStep>
    );
  }
  if (tela === 11) {
    return (
      <OnboardingStep key={tela} {...comum} titulo="As sugestões do plano e do Nutri foram úteis para você?" descricao="1 é nada úteis; 5 é muito úteis." podeContinuar={utilidade !== null} aoContinuar={() => setTela(12)}>
        <LikertQuestion rotulo="As sugestões do plano e do Nutri foram úteis para você?" opcoes={ESCALA_UTILIDADE} valor={utilidade} aoEscolher={setUtilidade} />
      </OnboardingStep>
    );
  }
  const ultima = tela === 13;
  const [rotulo, valor, mudar] = ultima ? ["O que atrapalhou ou faltou?", atrapalhou, setAtrapalhou] as const : ["O que mais te ajudou?", ajudou, setAjudou] as const;
  return (
    <OnboardingStep
      key={tela}
      {...comum}
      titulo={rotulo}
      descricao="Opcional. Escreva do seu jeito."
      rotuloBotao={ultima ? (erro ? "Tentar de novo" : "Enviar") : "Continuar"}
      rotuloSalvando="Enviando…"
      salvando={responder.isPending}
      erroAoSalvar={ultima ? erro : null}
      aoContinuar={ultima ? enviar : () => setTela(13)}
    >
      <label htmlFor="resposta-aberta" className="sr-only">
        {rotulo}
      </label>
      <textarea
        id="resposta-aberta"
        value={valor}
        maxLength={1000}
        onChange={(e) => mudar(e.target.value)}
        rows={5}
        className="w-full resize-none rounded-2xl border border-linha bg-white px-4 py-3 text-[15px] focus:border-tinta focus:outline-none"
      />
    </OnboardingStep>
  );
}
