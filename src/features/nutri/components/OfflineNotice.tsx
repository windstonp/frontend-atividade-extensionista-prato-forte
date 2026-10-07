import Link from "next/link";
import { IconeSemConexao } from "@/components/icons";
import { Aviso } from "@/components/ui/Aviso";

/** Sem internet: o plano continua acessível. */
export function OfflineNotice({ perguntaPresa }: { perguntaPresa: boolean }) {
  return (
    <Aviso
      tom="alerta"
      titulo={perguntaPresa ? "Sua pergunta não saiu daqui" : "Você está sem internet"}
      icone={<IconeSemConexao size={20} className="mt-0.5 shrink-0 text-alerta" />}
      className="mb-4"
    >
      O aparelho está sem internet. Seu plano de hoje continua salvo: dá para ver as refeições e marcar o que comeu.
      <Link
        href="/dieta"
        className="mt-2.5 flex h-9 w-fit items-center rounded-full border-[1.5px] border-alerta-texto px-3.5 text-[13px] font-semibold text-alerta-texto"
      >
        Ver as refeições de hoje
      </Link>
    </Aviso>
  );
}
