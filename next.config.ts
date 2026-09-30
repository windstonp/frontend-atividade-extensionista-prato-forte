import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

const versao = (JSON.parse(readFileSync("./package.json", "utf8")) as { version: string }).version;

const nextConfig: NextConfig = {
  // Versão no rodapé de Configurações: a do ambiente ou a do package.json.
  env: { NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? versao },
};

export default nextConfig;
