import type { ActivityLevel, Goal } from "./types";

export const OBJETIVOS: Record<Goal, string> = {
  "ganhar-massa": "Ganhar massa magra",
  "perder-gordura": "Perder gordura",
  "manter-peso": "Manter o peso",
  "mais-disposicao": "Ter mais disposição",
};

export const ATIVIDADES: Record<ActivityLevel, string> = {
  parado: "Quase não treino",
  leve: "1 ou 2 vezes por semana",
  moderado: "3 ou 4 vezes por semana",
  intenso: "5 ou 6 vezes por semana",
};

export const ALMOCO: Record<string, string> = {
  casa: "almoça em casa",
  marmita: "leva marmita",
  restaurante: "almoça no restaurante",
};

export const RESTRICOES: Record<string, string> = {
  lactose: "Intolerância a lactose",
  gluten: "Glúten",
  castanhas: "Amendoim e castanhas",
  "frutos-do-mar": "Frutos do mar",
  "sem-carne": "Não come carne",
  "sem-animal": "Nada de origem animal",
};

export const ALERGIAS = new Set(["castanhas", "frutos-do-mar"]);

export const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
