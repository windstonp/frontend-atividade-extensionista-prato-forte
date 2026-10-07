import { describe, expect, it } from 'vitest';
import manifest from './manifest';

describe('manifesto do PWA', () => {
  it('instalável, em tela cheia e com as cores do app', () => {
    expect(manifest()).toMatchObject({
      name: 'Prato Forte',
      short_name: 'Prato Forte',
      start_url: '/hoje',
      display: 'standalone',
      background_color: '#eceee7',
      theme_color: '#eceee7',
      icons: [
        { src: '/icone.svg', sizes: 'any', type: 'image/svg+xml' },
        { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    });
  });
});
