import type { Profile } from "@/lib/types";

/**
 * Dados fictícios de uma aluna da Zfit. Servem para validar a experiência
 * enquanto as entidades de nutrição não existem no backend.
 */

export const mockProfile: Profile = {
  name: "Camila Réus",
  initials: "CR",
  email: "camila.reus@gmail.com",
  age: 27,
  heightCm: 164,
  weightKg: 58.4,
  startWeightKg: 56.8,
  goalWeightKg: 62,
  goal: "ganhar-massa",
  activity: "moderado",
  workPosture: "sentada",
  trainingTime: "19:00",
  trainingDays: [1, 3, 5],
  wakeTime: "06:20",
  sleepTime: "23:00",
  lunchPlace: "marmita",
  gym: "Zfit",
  city: "Capivari de Baixo",
  memberSince: "agosto",
  pantry: [
    "Ovos",
    "Frango",
    "Carne moída",
    "Iogurte",
    "Queijo",
    "Arroz e feijão",
    "Batata-doce",
    "Tapioca",
    "Pão francês",
    "Aveia",
    "Banana",
    "Mamão",
  ],
  dislikes: ["Fígado", "Jiló"],
  restrictions: [
    { id: "castanhas", label: "Amendoim e castanhas", allergy: true },
  ],
};
