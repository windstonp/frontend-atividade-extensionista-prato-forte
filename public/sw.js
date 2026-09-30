/* Service worker do Prato Forte: só avisos (spec 06). Sem cache offline. */

self.addEventListener('push', (evento) => {
  const dados = evento.data ? evento.data.json() : {};
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
      if (aberta) return aberta.navigate(url).then((aba) => aba && aba.focus());
      return self.clients.openWindow(url);
    }),
  );
});
