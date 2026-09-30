import type { Avaliacao } from '@/features/validacao/tipos';
import type { Macros } from '@/lib/types';
import type { Slot } from '@/features/dia/tipos';

/** `GET /conversations` (spec 04 §5), já em camelCase. */
export interface Conversa {
  id: number;
  title: string | null;
  preview: string | null;
  messageCount: number;
  lastMessageAt: string | null;
}

export interface MensagemUsuario {
  id: number;
  role: 'user';
  content: string;
  createdAt: string;
}

export interface CartaoTroca {
  type: 'swap';
  slot: Slot;
  from: { foodId: number; name: string; amount: string; calories: number };
  to: { foodId: number; grams: number; name: string; amount: string; calories: number };
  carbsBefore: number;
  carbsAfter: number;
  calorieDelta: number;
}

export interface CartaoRefeicao {
  type: 'meal';
  slot: Slot;
  title: string;
  time: string;
  calories: number;
  macros: Macros;
  items: { foodId: number; grams: number; name: string; amount: string; calories: number }[];
  warning: string | null;
}

export interface AcaoNutri {
  index: number;
  kind: 'substituir' | 'aplicar-refeicao' | 'outra-opcao' | 'ver-refeicao' | 'dispensar';
  label: string;
  slot?: Slot;
}

export interface MensagemNutri {
  id: number;
  role: 'assistant';
  content: string;
  createdAt: string;
  followUp: string | null;
  followUpSuggestions: string[];
  card: CartaoTroca | CartaoRefeicao | null;
  actions: AcaoNutri[];
  actionsAvailable: boolean;
  rating: Avaliacao | null;
}

export type Mensagem = MensagemUsuario | MensagemNutri;

/** Pergunta que ainda não virou mensagem do servidor. */
export interface Pendente {
  id: string;
  content: string;
  status: 'enviando' | 'falhou';
}

export interface LinhaContexto {
  text: string;
  tone: 'gema' | 'alerta' | 'mata';
}

export interface SugestaoPergunta {
  id: string;
  question: string;
}

export interface Pagina<T> {
  data: T[];
  meta: { nextCursor: string | null; perPage: number };
}
