/* Service worker do Prato Forte: só avisos (spec 06). Sem cache offline. */

// Assume já as abas abertas: numa aba sem controle, `navigate()` falha ao tocar no aviso.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

self.addEventListener('push', (evento) => {
  let dados = {};
  try {
    dados = evento.data ? evento.data.json() : {};
  } catch {
    dados = {}; // payload que não é JSON: aviso padrão
  }
  evento.waitUntil(
    self.registration.showNotification(dados.title || 'Prato Forte', {
      body: dados.body || '',
      tag: dados.tag,
      icon: '/icone.svg',
      badge: '/icone.svg',
      data: { url: (dados.data && dados.data.url) || '/hoje' },
    }),
  );
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const url = new URL(evento.notification.data.url, self.location.origin).href;
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((abas) => {
      const aberta = abas.find((aba) => aba.url.startsWith(self.location.origin));
      if (!aberta) return self.clients.openWindow(url);
      return aberta
        .navigate(url)
        .then((aba) => (aba ? aba.focus() : self.clients.openWindow(url)))
        .catch(() => self.clients.openWindow(url));
    }),
  );
});
