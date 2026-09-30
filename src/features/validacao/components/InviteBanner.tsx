import Link from "next/link";

/** Convite para o questionário (RN41), dispensável. */
export function InviteBanner({ aoDispensar }: { aoDispensar: () => void }) {
  return (
    <section className="mb-4 animate-entra-topo rounded-[20px] bg-gema-fraca px-[18px] py-4 text-gema-texto">
      <p className="text-[14px] leading-snug">
        Você já usa o Prato Forte há uma semana. Topa responder umas perguntas rápidas? Leva uns 2 minutos e ajuda o projeto da UNINTER.
      </p>
      <div className="mt-3 flex gap-2">
        <Link href="/perfil/avaliar" className="flex h-10 items-center rounded-full bg-tinta px-4 text-[14px] font-semibold text-neve transition-transform active:scale-95">
          Responder
        </Link>
        <button type="button" onClick={aoDispensar} className="h-10 rounded-full px-3.5 text-[14px] font-semibold text-gema-texto">
          Agora não
        </button>
      </div>
    </section>
  );
}
