/** Versão vigente do termo (RN03) — igual a `config('prato.terms_version')` no backend. */
export const TERMO_VERSAO = '2026-10';

/**
 * Texto PROVISÓRIO do termo de uso dos dados de saúde.
 * A versão final é escrita pelos autores (pendência P3 em specs/99-inconsistencias.md);
 * trocou o texto de forma relevante? suba TERMO_VERSAO aqui e no backend.
 */
export const TERMO_PARAGRAFOS = [
  'O Prato Forte guarda seu peso, altura, idade, objetivo, restrições e alergias para montar e ajustar seu plano alimentar. São dados de saúde, e a LGPD pede o seu consentimento para usá-los.',
  'Ninguém da academia vê seus dados. Na pesquisa do projeto de extensão da UNINTER, usamos só números agregados e anônimos, sem nome nem e-mail.',
  'Se você avaliar uma resposta ou o app e escrever um comentário, ele entra na pesquisa como você escreveu, sem o seu nome.',
  'Para montar o cardápio, uma inteligência artificial recebe seus números e a lista de alimentos, sem o seu nome completo nem o seu e-mail. No chat, o Nutri recebe o nome como você prefere ser chamado.',
  'Você pode apagar sua conta e todos os seus dados quando quiser, em Perfil › Configurações.',
];
