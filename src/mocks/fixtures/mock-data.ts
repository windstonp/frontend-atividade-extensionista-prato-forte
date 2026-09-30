import type { DayAdherence, Profile, WeighIn } from "@/lib/types";

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

export const mockWeighIns: WeighIn[] = [
  { date: "2026-08-11", weightKg: 56.8 },
  { date: "2026-08-18", weightKg: 57.0 },
  { date: "2026-08-25", weightKg: 57.5 },
  { date: "2026-09-01", weightKg: 57.6 },
  { date: "2026-09-08", weightKg: 58.0 },
  { date: "2026-09-15", weightKg: 58.4 },
];

const padrao: DayAdherence["status"][] = [
  "completo", "completo", "parcial", "completo", "completo", "vazio", "completo",
  "completo", "parcial", "completo", "completo", "completo", "completo", "vazio",
  "completo", "completo", "completo", "parcial", "completo", "completo", "completo",
  "completo", "completo", "vazio", "completo", "completo", "completo", "hoje",
];

export const mockAdherence: DayAdherence[] = padrao.map((status, i) => {
  const d = new Date("2026-08-25T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + i);
  return { date: d.toISOString().slice(0, 10), status };
});
