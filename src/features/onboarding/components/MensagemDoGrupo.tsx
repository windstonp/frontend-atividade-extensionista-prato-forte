/** Erro de um grupo de opções (rádios, chips), abaixo dele. */
export function MensagemDoGrupo({ texto }: { texto?: string }) {
  return texto ? <p className="mt-2 animate-entra text-[12.5px] leading-snug font-medium text-alerta">{texto}</p> : null;
}
