import type { Goal } from '@/lib/types';
import { type Medidas, METRICO } from '@/lib/units';
import type { Pesagem, PesoDoPeriodo, StatusDia } from './tipos';

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
// `+ 1e-9`: 58,65 × 10 em ponto flutuante dá 586,4999…; a pessoa digitou 58,65 e espera 58,7.
const umaCasa = (n: number) => Math.round(n * 10 + 1e-9) / 10;
const limitarKg = (kg: number) => Math.min(250, Math.max(30, kg));

/** Mensagem de comparação com a última pesagem, por objetivo (spec 05 §4 S16). */
export function mensagemDaDiferenca(objetivo: Goal, diferencaKg: number, diasDesdeUltima: number, m: Medidas = METRICO): string {
  const g = Math.round(Math.abs(diferencaKg) * 1000 / 100) * 100;
  if (g === 0) {
    return diasDesdeUltima >= 5 ? 'Mesmo peso da semana passada. Uma semana estável é normal.' : 'Mesmo peso da última pesagem.';
  }
  const subiu = diferencaKg > 0;
  const numero = `São ${m.diferenca(diferencaKg)} ${subiu ? 'a mais' : 'a menos'} que na última pesagem.`;
  const complemento: Record<Goal, string | null> = {
    'ganhar-massa': subiu ? 'Dentro do esperado para quem está ganhando massa.' : 'Vale conferir se a semana teve menos refeições no plano.',
    'perder-gordura': subiu ? 'Oscilação de uma semana é normal. Vale olhar a constância.' : 'Dentro do esperado para quem está perdendo gordura.',
    'manter-peso': g <= 500 ? 'Dentro do esperado para quem quer manter.' : 'Vale olhar a constância desta semana.',
    'mais-disposicao': null,
  };
  return complemento[objetivo] ? `${numero} ${complemento[objetivo]}` : numero;
}

/** ± um passo (100 g ou 0,2 lb) sobre o número exibido, dentro de 30–250 kg (RN34). */
export function ajustarPeso(kg: number, direcao: 1 | -1, m: Medidas = METRICO): number {
  return limitarKg(m.deExibido(umaCasa(m.exibir(kg) + direcao * m.passo)));
}

/** O que a pessoa digitou (na unidade exibida, aceita vírgula), em kg; inválido volta ao anterior. */
export function lerPesoDigitado(texto: string, anteriorKg: number, m: Medidas = METRICO): number {
  const n = Number(texto.trim().replace(',', '.'));
  if (texto.trim() === '' || !Number.isFinite(n)) return anteriorKg;
  return limitarKg(m.deExibido(umaCasa(n)));
}

/** Régua de ±`regua` em volta da base (na unidade exibida); o marcador fica entre 4% e 96%. */
export const posicaoNaRegua = (atual: number, base: number, regua = 1) =>
  Math.min(96, Math.max(4, Math.round((50 + ((atual - base) / (2 * regua)) * 100) * 10) / 10));

export const diasEntre = (de: string, ate: string) =>
  Math.round((Date.parse(`${ate}T12:00:00`) - Date.parse(`${de}T12:00:00`)) / 86_400_000);

/** Data de hoje no fuso do aparelho, `YYYY-MM-DD`. */
export function hojeLocal(agora = new Date()): string {
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
}

/** RN35 na tela: previsão, pedido de mais pesagens ou aviso neutro; nada sem meta. */
export function textoDaPrevisao(peso: PesoDoPeriodo): string | null {
  if (peso.goalKg === null) return null;
  if (peso.forecast) {
    // "por volta do início/fim de…", mas "por volta de meados de…".
    const artigo = peso.forecast.label.startsWith('meados') ? 'de' : 'do';
    return `No ritmo das últimas semanas, você chega na meta por volta ${artigo} ${peso.forecast.label}.`;
  }
  const pontos = peso.points;
  if (pontos.length < 3 || diasEntre(pontos[0].date, pontos[pontos.length - 1].date) < 14) {
    return 'Registre mais uma pesagem para estimar quando você chega na meta.';
  }
  return 'Com as pesagens de agora, a linha ainda não aponta para a meta.';
}

/** "+1,6 kg em 5 semanas" — semanas reais entre a primeira e a última pesagem do período. */
export function textoDaVariacao(peso: PesoDoPeriodo, m: Medidas = METRICO): string {
  const semanas = peso.spanWeeks ?? 0;
  if (peso.points.length <= 1) return 'primeira pesagem';
  const variacao = peso.changeKg ?? 0;
  const sinal = variacao > 0 ? '+' : variacao < 0 ? '−' : '';
  const quando = semanas === 0 ? 'nesta semana' : `em ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
  return `${sinal}${m.peso(Math.abs(variacao))} ${quando}`;
}

const DESCRICAO: Record<StatusDia, string> = {
  completo: 'dia completo',
  parcial: 'parte das refeições',
  vazio: 'nenhuma refeição feita',
  hoje: 'hoje',
};

export function rotuloDoDia(dia: { date: string; status: StatusDia }): string {
  const [, mes, d] = dia.date.split('-').map(Number);
  return `${d} de ${MESES[mes - 1]}: ${DESCRICAO[dia.status]}`;
}

/** Até `max` rótulos de data, espalhados, sempre com o primeiro e o último ponto. */
export function rotulosDeData(pontos: { date: string }[], max = 6): { indice: number; date: string }[] {
  if (pontos.length <= max) return pontos.map((p, indice) => ({ indice, date: p.date }));
  const passo = (pontos.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => {
    const indice = Math.round(i * passo);
    return { indice, date: pontos[indice].date };
  });
}

/** "Suas pesagens": as 4 últimas, mais recente primeiro; a primeira de todas diz "início". */
export function historico(pesagens: Pesagem[]): { date: string; weightKg: number; deltaG: number | null }[] {
  return pesagens
    .map((p, i) => ({ date: p.date, weightKg: p.weightKg, deltaG: i === 0 ? null : Math.round((p.weightKg - pesagens[i - 1].weightKg) * 1000) }))
    .reverse()
    .slice(0, 4);
}
