import { readFileSync } from "node:fs";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const versao = (JSON.parse(readFileSync("./package.json", "utf8")) as { version: string }).version;

/** No build de produção a URL da API vai fixa no bundle: sem ela, o app apontaria para localhost. */
function exigirUrlDaApi() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("Defina NEXT_PUBLIC_API_URL antes do build (veja .env.example).");
  if (!URL.canParse(url) || url.endsWith("/"))
    throw new Error(`NEXT_PUBLIC_API_URL inválida: "${url}". Use a URL completa, sem barra no fim.`);
}

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) exigirUrlDaApi();

  return {
    // Versão no rodapé de Configurações: a do ambiente ou a do package.json.
    env: { NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || versao },
  };
}
