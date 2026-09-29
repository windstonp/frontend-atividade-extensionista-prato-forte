import {
  mockAdherence,
  mockDayPlan,
  mockProfile,
  mockSubstitutions,
  mockSuggestions,
  mockWeighIns,
} from "@/mocks/fixtures/mock-data";
import type {
  DayAdherence,
  DayPlan,
  NutriContext,
  NutriMessage,
  NutriSuggestion,
  OnboardingAnswers,
  Profile,
  Substitution,
  WeighIn,
} from "./types";

/**
 * Camada única entre as telas e os dados.
 *
 * Hoje tudo devolve mock. Quando o backend ganhar as rotas de nutrição,
 * só o corpo destas funções muda — as telas continuam iguais. O comentário
 * em cada função diz qual endpoint ela deve chamar.
 *
 * O que já existe no backend: POST /users, POST /sessions, POST /refresh-token,
 * POST /password/forgot, POST /password/reset, PATCH /users/avatar,
 * GET|POST|DELETE /chats, POST /messages/:chat_id.
 */

const PAUSA_CURTA = 260;
const PAUSA_IA = 900;

function espera<T>(valor: T, ms = PAUSA_CURTA): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

/** GET /profile */
export function getProfile(): Promise<Profile> {
  return espera(mockProfile);
}

/** GET /plans/day?date=YYYY-MM-DD */
export function getDayPlan(): Promise<DayPlan> {
  return espera(mockDayPlan, 420);
}

/** GET /foods/:foodId/substitutions */
export function getSubstitutions(foodId: string): Promise<Substitution[]> {
  return espera(mockSubstitutions[foodId] ?? [], 340);
}

/** GET /weigh-ins */
export function getWeighIns(): Promise<WeighIn[]> {
  return espera(mockWeighIns);
}

/** GET /adherence?days=28 */
export function getAdherence(): Promise<DayAdherence[]> {
  return espera(mockAdherence);
}

/** GET /nutri/suggestions — sugestões dependem da refeição da vez */
export function getSuggestions(): Promise<NutriSuggestion[]> {
  return espera(mockSuggestions, 200);
}

/** POST /plans — roda o onboarding pela IA e devolve o plano da semana */
export function generatePlan(_answers: Partial<OnboardingAnswers>): Promise<DayPlan> {
  return espera(mockDayPlan, 2600);
}

/** POST /weigh-ins */
export function saveWeighIn(weightKg: number): Promise<WeighIn> {
  const hoje = new Date().toISOString().slice(0, 10);
  return espera({ date: hoje, weightKg });
}

/**
 * POST /messages/:chat_id
 *
 * Atenção na hora de ligar de verdade: hoje o controller consome o stream
 * inteiro e responde 201 sem corpo, então o front não recebe a resposta na
 * mesma chamada. Precisa devolver a mensagem (ou abrir streaming) para esta
 * função funcionar.
 */
export function askNutri(question: string): Promise<NutriMessage> {
  const texto = question.toLowerCase();
  const id = `nutri-${Date.now()}`;

  if (texto.includes("batata") || texto.includes("arroz")) {
    return espera(
      {
        id,
        role: "assistant",
        content:
          "Pode. No seu almoço os 150 g de arroz entram com 42 g de carboidrato. Para chegar perto, use 180 g de batata-doce cozida. O resto do prato fica igual.",
        followUp:
          "A batata-doce tem mais fibra, então costuma segurar a fome melhor até o pré-treino das 17:30.",
        swap: {
          fromName: "Arroz branco",
          fromAmount: "150 g",
          fromCalories: 195,
          toName: "Batata-doce",
          toAmount: "180 g",
          toCalories: 140,
          carbsBefore: 42,
          carbsAfter: 33,
          calorieDelta: -55,
        },
        actions: [
          {
            kind: "substituir",
            mealId: "almoco",
            foodId: "arroz-branco",
            substitutionId: "batata-doce",
            label: "Substituir no almoço de hoje",
          },
          { kind: "outra-opcao", label: "Ver outras opções" },
          { kind: "dispensar", label: "Agora não" },
        ],
      } satisfies NutriMessage,
      PAUSA_IA,
    );
  }

  if (texto.includes("frango")) {
    return espera(
      {
        id,
        role: "assistant",
        content:
          "Sem problema. O frango do almoço entra com 45 g de proteína. Com o que você marcou na cozinha, o atum em lata é a troca mais próxima e ainda vai direto para a marmita.",
        swap: {
          fromName: "Frango grelhado",
          fromAmount: "150 g",
          fromCalories: 240,
          toName: "Atum em lata",
          toAmount: "1 lata escorrida",
          toCalories: 190,
          carbsBefore: 0,
          carbsAfter: 0,
          calorieDelta: -50,
        },
        actions: [
          {
            kind: "substituir",
            mealId: "almoco",
            foodId: "frango-grelhado",
            substitutionId: "atum",
            label: "Substituir no almoço de hoje",
          },
          { kind: "outra-opcao", label: "Ver outras opções" },
          { kind: "dispensar", label: "Agora não" },
        ],
      } satisfies NutriMessage,
      PAUSA_IA,
    );
  }

  if (texto.includes("jantar") || texto.includes("ovo") || texto.includes("brócolis")) {
    return espera(
      {
        id,
        role: "assistant",
        content:
          "Dá para fechar o jantar só com isso. Como você treina às 19h, deixei a batata-doce um pouco maior:",
        meal: {
          title: "Jantar",
          time: "20:30",
          calories: 375,
          macros: { protein: 24, carbs: 32, fat: 16 },
          items: [
            { name: "Ovos mexidos", amount: "3 unidades", calories: 230 },
            { name: "Batata-doce cozida", amount: "150 g", calories: 115 },
            { name: "Brócolis no vapor", amount: "100 g", calories: 30 },
          ],
          warning:
            "Fica 8 g de proteína abaixo do jantar original. Se sobrar frango do almoço, 30 g já resolvem.",
        },
        actions: [
          { kind: "aplicar-refeicao", mealId: "jantar", label: "Aplicar no jantar de hoje" },
          { kind: "outra-opcao", label: "Gerar outra opção" },
          { kind: "dispensar", label: "Agora não" },
        ],
      } satisfies NutriMessage,
      PAUSA_IA,
    );
  }

  if (texto.includes("treino") || texto.includes("antes")) {
    return espera(
      {
        id,
        role: "assistant",
        content:
          "Seu pré-treino das 17:30 já é tapioca com queijo minas: 120 g de carboidrato de digestão rápida com um pouco de proteína, o que costuma cair bem uma hora e meia antes do treino.",
        followUp:
          "Se o treino atrasar para depois das 20h, coma uma banana por volta das 19h para não chegar com fome na série.",
        actions: [
          { kind: "ver-refeicao", mealId: "pre-treino", label: "Ver o pré-treino" },
          { kind: "outra-opcao", label: "Sugerir outra opção" },
        ],
      } satisfies NutriMessage,
      PAUSA_IA,
    );
  }

  return espera(
    {
      id,
      role: "assistant",
      content:
        "Ainda não sei responder isso por aqui. Enquanto o Nutri não conhece o assunto, vale perguntar sobre uma refeição do seu dia, uma troca de alimento ou o que comer antes do treino.",
      actions: [{ kind: "ver-refeicao", mealId: "almoco", label: "Ver o almoço de hoje" }],
    } satisfies NutriMessage,
    PAUSA_IA,
  );
}

/** Monta o que o Nutri enxerga agora, a partir do plano e do perfil */
export function buildNutriContext(
  plan: DayPlan,
  profile: Profile,
  caloriesLeft: number,
  proteinLeft: number,
): NutriContext {
  const proxima = plan.meals.find((m) => !m.done);
  const alergia = profile.restrictions.find((r) => r.allergy);

  const lines: NutriContext["lines"] = [];
  if (proxima) {
    lines.push({
      text: `Seu ${proxima.name.toLowerCase()} das ${proxima.time}, com ${proxima.summary.toLowerCase()}`,
      tone: "gema",
    });
  }
  lines.push({
    text: `${caloriesLeft.toLocaleString("pt-BR")} kcal e ${Math.round(proteinLeft)} g de proteína ainda no plano de hoje`,
    tone: "gema",
  });
  if (alergia) {
    lines.push({ text: `Sua alergia a ${alergia.label.toLowerCase()}`, tone: "alerta" });
  }
  lines.push({ text: "Seu objetivo de ganhar massa magra até dezembro", tone: "mata" });
  return lines.length ? { lines } : { lines: [] };
}
