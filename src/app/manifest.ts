import type { MetadataRoute } from 'next';

/** PWA: no iPhone os avisos só chegam com o app na tela de início (RNF-OPE-05). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Prato Forte',
    short_name: 'Prato Forte',
    description: 'Guia nutricional para quem treina na Zfit.',
    start_url: '/hoje',
    display: 'standalone',
    background_color: '#eceee7',
    theme_color: '#eceee7',
    lang: 'pt-BR',
    icons: [{ src: '/icone.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
