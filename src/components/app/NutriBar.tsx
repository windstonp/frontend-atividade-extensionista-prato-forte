import Link from "next/link";
import { IconeAvancar, MarcaNutri } from "@/components/icons";

/** O atalho para o Nutri carrega o contexto da tela em que a pessoa está. */
export function NutriBar({
  texto,
  href = "/nutri",
  className = "",
  style,
}: {
  texto: string;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Link
      href={href}
      style={style}
      className={`group flex h-13 items-center gap-3 rounded-full border border-linha bg-white py-2 pr-2 pl-4 transition-[border-color,box-shadow,transform] duration-250 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-px hover:border-pedra hover:shadow-[0_10px_26px_-18px_rgba(21,37,28,.9)] ${className}`}
    >
      <span className="transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110">
        <MarcaNutri size={24} />
      </span>
      <span className="flex-1 text-sm font-medium">{texto}</span>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-papel transition-[background-color,transform] duration-250 group-hover:translate-x-0.5 group-hover:bg-gema-fraca">
        <IconeAvancar size={17} />
      </span>
    </Link>
  );
}
