export type ValorAvaliacao = 'up' | 'down';

export interface Avaliacao {
  value: ValorAvaliacao;
  comment: string | null;
}

export interface Alvo {
  tipo: 'nutri_message' | 'meal_plan';
  id: number;
}

export interface StatusUsabilidade {
  round: string;
  responded: boolean;
  invite: boolean;
}

export interface RespostaUsabilidade {
  susAnswers: number[];
  usefulness: number;
  liked: string | null;
  disliked: string | null;
}
