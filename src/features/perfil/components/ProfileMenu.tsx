import Link from "next/link";
import { IconeAvancar } from "@/components/icons";
import { cascata } from "@/lib/motion";

export type ItemDoPerfil = { href: string; titulo: string; valor: string; alerta?: boolean; desabilitado?: boolean };

/** Lista de seções do perfil; item desabilitado não leva a lugar nenhum (ex.: "Obrigado por avaliar!"). */
export function ProfileMenu({ itens }: { itens: ItemDoPerfil[] }) {
  return (
    <nav aria-label="Seu perfil" className="mt-4 rounded-[20px] bg-white px-[18px]">
      {itens.map((item, i) => {
        const classe = `group flex min-h-15 animate-entra items-center gap-3.5 py-3 transition-colors duration-200 ${
          item.desabilitado ? "" : "hover:text-mata"
        } ${i < itens.length - 1 ? "border-b border-fio" : ""}`;
        const conteudo = (
          <span className="flex-1">
            <span className="block text-[15px] font-semibold">{item.titulo}</span>
            <span className={`mt-0.5 block text-[13px] ${item.alerta ? "text-alerta" : "text-fumo"}`}>{item.valor}</span>
          </span>
        );
        // Já respondeu o questionário nesta rodada: o item agradece e não leva a lugar nenhum (CA06).
        if (item.desabilitado) {
          return (
            <div key={item.titulo} style={cascata(i, 60, 320)} className={classe}>
              {conteudo}
            </div>
          );
        }
        return (
          <Link key={item.titulo} href={item.href} style={cascata(i, 60, 320)} className={classe}>
            {conteudo}
            <IconeAvancar
              size={18}
              className="shrink-0 text-fumo transition-[color,transform] duration-250 group-hover:translate-x-1 group-hover:text-tinta"
            />
          </Link>
        );
      })}
    </nav>
  );
}
