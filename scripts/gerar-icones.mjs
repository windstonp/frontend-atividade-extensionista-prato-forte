// Gera os PNG do PWA a partir de public/icone.svg (rodar uma vez: node scripts/gerar-icones.mjs dentro do contêiner web).
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

// Sem cantos arredondados: iOS e ícones "maskable" recortam sozinhos (canto branco ficaria aparente).
const svg = readFileSync('public/icone.svg', 'utf8').replace(/rx="\d+"/, 'rx="0"');
const navegador = await chromium.launch();
const pagina = await navegador.newPage();
for (const [arquivo, lado] of [['icone-192.png', 192], ['icone-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await pagina.setViewportSize({ width: lado, height: lado });
  await pagina.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${lado}" height="${lado}" `)}</body></html>`);
  await pagina.screenshot({ path: `public/${arquivo}`, omitBackground: false });
}
await navegador.close();
