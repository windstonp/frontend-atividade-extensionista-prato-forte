/** "Camila Réus" → "CR" (primeira e última palavra). */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return `${primeira}${ultima}`.toLocaleUpperCase('pt-BR');
}

/** Mês e ano do cadastro, no fuso da comunidade (P1: "No Prato Forte desde …"). */
export function desdeQuando(createdAt: string): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(createdAt));
}

export const metros = (cm: number) => `${(cm / 100).toFixed(2).replace('.', ',')} m`;
