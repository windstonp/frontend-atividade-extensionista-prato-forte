import Link from "next/link";
import { IconeVoltar } from "@/components/icons";

export function TopBar({
  voltarPara,
  rotuloVoltar = "Voltar",
  direita,
  className = "",
}: {
  voltarPara: string;
  rotuloVoltar?: string;
  direita?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`flex h-15 shrink-0 items-center justify-between px-5 pt-5 ${className}`}
    >
      <Link
        href={voltarPara}
        aria-label={rotuloVoltar}
        className="-ml-2.5 flex size-10 items-center justify-center rounded-full text-current hover:bg-tinta/5"
      >
        <IconeVoltar size={22} />
      </Link>
      {direita}
    </header>
  );
}
