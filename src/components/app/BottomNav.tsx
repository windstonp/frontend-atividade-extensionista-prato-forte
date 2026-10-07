"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconeEvolucao,
  IconePessoa,
  IconePrato,
  IconeTalher,
} from "@/components/icons";

const ABAS = [
  { href: "/hoje", rotulo: "Hoje", Icone: IconePrato },
  { href: "/dieta", rotulo: "Dieta", Icone: IconeTalher },
  { href: "/evolucao", rotulo: "Evolução", Icone: IconeEvolucao },
  { href: "/perfil", rotulo: "Perfil", Icone: IconePessoa },
];

export function BottomNav() {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-30 flex shrink-0 border-t border-linha bg-white/92 px-1 pt-[7px] pb-seguro-4 backdrop-blur-lg"
    >
      {ABAS.map(({ href, rotulo, Icone }) => {
        const ativo = caminho === href || caminho.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={`flex min-h-[52px] flex-1 flex-col items-center gap-1 pt-[7px] pb-[5px] transition-colors duration-250 active:scale-90 ${
              ativo ? "text-tinta" : "text-fumo hover:text-tinta"
            }`}
          >
            <Icone
              size={22}
              className={`transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${
                ativo ? "scale-110" : "scale-100"
              }`}
            />
            <span className={`text-[11px] ${ativo ? "font-semibold" : "font-medium"}`}>
              {rotulo}
            </span>
            <span
              className={`block h-0.5 w-4 rounded-full ${
                ativo ? "animate-tique bg-gema" : "bg-transparent"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
