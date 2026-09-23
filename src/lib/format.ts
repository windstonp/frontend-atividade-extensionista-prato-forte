export const kcal = (n: number) => `${Math.round(n).toLocaleString("pt-BR")} kcal`;

export const gramas = (n: number) => {
  const arredondado = Math.round(n * 10) / 10;
  return `${arredondado.toLocaleString("pt-BR")} g`;
};

export const peso = (n: number) =>
  `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;

export const porcentagem = (parte: number, total: number) =>
  total <= 0 ? 0 : Math.min(100, Math.max(0, (parte / total) * 100));

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function dataPorExtenso(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return `${DIAS[d.getDay()].replace(/^./, (c) => c.toUpperCase())}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export function diaCurto(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
}

export function saudacao(hora = new Date().getHours()) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}
