/** Navega recarregando a página: descarta todo o estado do cliente (cache, formulários). */
export function recarregarEm(url: string): void {
  window.location.assign(url);
}
