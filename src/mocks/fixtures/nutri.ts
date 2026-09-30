/** Conversas e mensagens como a API devolve (snake_case). */

export function conversaApi(id: number, opcoes: { vazia?: boolean; titulo?: string } = {}) {
  return opcoes.vazia
    ? { id, title: null, preview: null, message_count: 0, last_message_at: null }
    : {
        id,
        title: opcoes.titulo ?? 'Posso trocar o arroz por batata?',
        preview: 'Pode. No seu almoço os 150 g de arroz entram com 42 g de carboidrato…',
        message_count: 6,
        last_message_at: '2026-09-30T12:10:00-03:00',
      };
}

export const mensagemUsuarioApi = (id: number, content = 'Posso trocar o arroz por batata?') => ({
  id,
  role: 'user',
  content,
  created_at: '2026-10-01T11:02:00-03:00',
});

export function respostaTrocaApi(id: number, opcoes: { acoes?: boolean } = {}) {
  const acoes = opcoes.acoes ?? true;
  return {
    id,
    role: 'assistant',
    content: 'Pode. No seu almoço os 150 g de arroz entram com 42 g de carboidrato.',
    created_at: '2026-10-01T11:02:07-03:00',
    follow_up: 'A batata-doce tem mais fibra e segura a fome até o treino.',
    follow_up_suggestions: ['E no jantar, o que como?', 'Por que a batata segura mais a fome?'],
    card: {
      type: 'swap',
      slot: 'almoco',
      from: { food_id: 28, name: 'Arroz branco cozido', amount: '150 g, mais ou menos 6 colheres de sopa', calories: 192 },
      to: { food_id: 30, grams: 230, name: 'Batata-doce cozida', amount: '230 g, mais ou menos 1,5 unidades médias', calories: 177 },
      carbs_before: 42.2,
      carbs_after: 42.3,
      calorie_delta: -15,
    },
    actions: acoes
      ? [
          { index: 0, kind: 'substituir', label: 'Substituir no almoço de hoje', slot: 'almoco' },
          { index: 1, kind: 'outra-opcao', label: 'Ver outras opções' },
          { index: 2, kind: 'dispensar', label: 'Agora não' },
        ]
      : [],
    actions_available: acoes,
    rating: null,
  };
}

export function respostaRefeicaoApi(id: number) {
  return {
    id,
    role: 'assistant',
    content: 'Montei um jantar leve com o que costuma ter em casa.',
    created_at: '2026-10-01T11:05:00-03:00',
    follow_up: null,
    follow_up_suggestions: ['E se eu treinar à noite?'],
    card: {
      type: 'meal',
      slot: 'jantar',
      title: 'Jantar',
      time: '20:30',
      calories: 375,
      macros: { protein: 24.1, carbs: 31.2, fat: 14.6 },
      items: [
        { food_id: 1, grams: 100, name: 'Ovos cozidos', amount: '100 g, mais ou menos 2 unidades', calories: 146 },
        { food_id: 50, grams: 80, name: 'Brócolis no vapor', amount: '80 g, mais ou menos 4 ramos', calories: 20 },
        { food_id: 30, grams: 100, name: 'Batata-doce cozida', amount: '100 g', calories: 77 },
      ],
      warning: 'Fica 8 g de proteína abaixo do jantar original.',
    },
    actions: [
      { index: 0, kind: 'aplicar-refeicao', label: 'Aplicar no jantar de hoje', slot: 'jantar' },
      { index: 1, kind: 'outra-opcao', label: 'Gerar outra opção' },
      { index: 2, kind: 'dispensar', label: 'Agora não' },
    ],
    actions_available: true,
    rating: null,
  };
}

export const contextoApi = [
  { text: 'Seu almoço das 12:30, com arroz branco cozido, feijão carioca, frango grelhado e salada', tone: 'gema' },
  { text: '1.250 kcal e 85 g de proteína ainda no plano de hoje', tone: 'gema' },
  { text: 'Sua alergia a amendoim e castanhas', tone: 'alerta' },
  { text: 'Seu objetivo de ganhar massa magra, com meta de 62 kg', tone: 'mata' },
];

export const sugestoesApi = [
  { id: 'trocar-carbo', question: 'Posso trocar o arroz branco cozido por outra coisa?' },
  { id: 'sem-proteina', question: 'Não tenho frango grelhado em casa. O que uso no lugar?' },
  { id: 'pre-treino', question: 'O que comer antes do treino das 19:00?' },
];
