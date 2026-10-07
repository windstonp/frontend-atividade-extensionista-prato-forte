import Link from "next/link";
import { IconeAjustes } from "@/components/icons";
import { iniciais } from "../formato";

/** Cabeçalho do perfil: iniciais, nome, desde quando e o atalho para configurações. */
export function ProfileHeader({ nome, desde }: { nome: string; desde: string }) {
  return (
    <header className="flex shrink-0 items-center gap-3.5 px-5 pt-[22px] pb-3.5 area-segura-cima">
      <span
        aria-hidden="true"
        className="flex size-[58px] shrink-0 animate-pop items-center justify-center rounded-full bg-tinta text-[19px] font-semibold text-neve"
      >
        {iniciais(nome)}
      </span>
      <div className="flex-1 animate-entra" style={{ animationDelay: "90ms" }}>
        <h1 className="font-display text-[22px] font-bold tracking-[-0.02em]">{nome}</h1>
        <p className="mt-0.5 text-[13px] text-fumo">No Prato Forte desde {desde}</p>
      </div>
      <Link
        href="/perfil/configuracoes"
        aria-label="Abrir configurações"
        className="group flex size-[42px] shrink-0 animate-entra items-center justify-center rounded-full border border-linha bg-white transition-[border-color] duration-250 hover:border-pedra"
        style={{ animationDelay: "160ms" }}
      >
        <IconeAjustes size={20} className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:rotate-90" />
      </Link>
    </header>
  );
}
