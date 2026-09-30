import type { AcaoNutri, Mensagem, MensagemNutri } from './tipos';

/** Páginas chegam mais recentes primeiro; o chat mostra da mais antiga para a mais nova, sem repetir. */
export function juntarPaginas(paginas: Mensagem[][]): Mensagem[] {
  const porId = new Map<number, Mensagem>();
  for (const pagina of paginas) for (const m of pagina) porId.set(m.id, porId.get(m.id) ?? m);
  return [...porId.values()].sort((a, b) => a.id - b.id);
}

/** "Ver outras opções"/"Gerar outra opção" viram uma pergunta nova (RF21). */
export function perguntaDaAcao(acao: AcaoNutri, mensagem: MensagemNutri): string | null {
  if (acao.kind !== 'outra-opcao') return null;
  return mensagem.card?.type === 'meal' ? `Monte outra opção de ${mensagem.card.title.toLowerCase()}` : 'Quero ver outras opções';
}

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const diaLocal = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "hoje", "ontem", o dia da semana até 6 dias, depois "dd/mm". */
export function quando(iso: string, agora = new Date()): string {
  const data = new Date(iso);
  const dias = Math.round((diaLocal(agora) - diaLocal(data)) / 86_400_000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 7) return DIAS[data.getDay()];
  return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}`;
}

/** `?pergunta=` vira texto do campo: até 200 caracteres. */
export const perguntaDaUrl = (valor: string | null) => (valor ?? '').trim().slice(0, 200);

/** RN45 — os chips são sempre os da última resposta do Nutri. */
export function ultimasSugestoes(mensagens: Mensagem[]): string[] {
  for (let i = mensagens.length - 1; i >= 0; i--) {
    const m = mensagens[i];
    if (m.role === 'assistant') return m.followUpSuggestions ?? [];
  }
  return [];
}
