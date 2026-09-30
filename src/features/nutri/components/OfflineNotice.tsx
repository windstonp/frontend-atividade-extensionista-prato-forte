import Link from "next/link";
import { IconeSemConexao } from "@/components/icons";

/** Sem internet: o plano continua acessível. */
export function OfflineNotice() {
  return (
    <div role="alert" className="mb-4 flex animate-entra-topo items-start gap-3 rounded-2xl bg-alerta-fraca p-4">
      <IconeSemConexao size={20} className="mt-0.5 shrink-0 text-alerta" />
      <div>
        <p className="text-[14.5px] font-semibold text-alerta-texto">Sua pergunta não saiu daqui</p>
        <p className="mt-1 text-[13px] leading-snug text-alerta-texto">
          O aparelho está sem internet. Seu plano de hoje continua salvo: dá para ver as refeições e marcar o que comeu.
        </p>
        <Link
          href="/dieta"
          className="mt-2.5 inline-flex h-9 items-center rounded-full border-[1.5px] border-alerta-texto px-3.5 text-[13px] font-semibold text-alerta-texto"
        >
          Ver as refeições de hoje
        </Link>
      </div>
    </div>
  );
}
