import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { MarcaNutri } from "@/components/icons";

const HORARIOS = [
  { hora: "7h", destaque: false },
  { hora: "10h", destaque: false },
  { hora: "12h30", destaque: true },
  { hora: "17h30", destaque: false },
  { hora: "20h30", destaque: false },
];

export default function BoasVindas() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-between bg-tinta px-7 pt-13 pb-9 text-neve area-segura-cima area-segura-baixo">
      <div className="flex animate-entra items-center gap-2.5">
        <span className="animate-flutua">
          <MarcaNutri size={18} />
        </span>
        <span className="font-display text-[17px] font-bold tracking-[-0.015em]">
          Prato Forte
        </span>
      </div>

      <div className="py-10">
        <p className="mb-5 animate-entra text-[13px] text-musgo" style={{ animationDelay: "120ms" }}>
          Feito para quem treina na Zfit, em Capivari de Baixo
        </p>
        <h1
          className="animate-entra font-display text-[40px] leading-[1.03] font-bold tracking-[-0.03em]"
          style={{ animationDelay: "200ms" }}
        >
          Sua dieta cabe na sua rotina de treino.
        </h1>
        <p
          className="mt-[18px] max-w-[300px] animate-entra text-[15px] leading-relaxed text-salvia"
          style={{ animationDelay: "320ms" }}
        >
          Montamos seu cardápio com a comida que você já come em casa, e ajustamos
          quando o dia sai do plano.
        </p>
      </div>

      <div>
        <div className="relative h-10">
          <span className="absolute inset-x-0 bottom-0 h-px bg-[#33443a]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between">
            {HORARIOS.map(({ hora, destaque }, i) => (
              <span
                key={hora}
                className={`block w-[2px] origin-bottom animate-tique ${
                  destaque ? "h-7 bg-gema" : "h-3.5 bg-[#4a5d52]"
                }`}
                style={{
                  animationName: "pf-entra",
                  animationDelay: `${480 + i * 90}ms`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-[7px] flex justify-between text-[11px] text-cinza-treino">
          {HORARIOS.map(({ hora, destaque }, i) => (
            <span
              key={hora}
              className={`animate-entra ${destaque ? "font-semibold text-gema" : ""}`}
              style={{ animationDelay: `${540 + i * 90}ms` }}
            >
              {hora}
            </span>
          ))}
        </div>
        <p
          className="mt-3 animate-entra text-[13px] leading-normal text-musgo"
          style={{ animationDelay: "980ms" }}
        >
          Cinco refeições, nos horários em que você realmente come.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="animate-entra" style={{ animationDelay: "1080ms" }}>
          <ButtonLink href="/onboarding/objetivo">Montar meu plano</ButtonLink>
        </div>
        <div className="animate-entra" style={{ animationDelay: "1160ms" }}>
          <ButtonLink href="/hoje" variante="contorno-escuro" className="h-[50px]">
            Já tenho conta
          </ButtonLink>
        </div>
        <p
          className="mt-0.5 animate-entra text-center text-[12.5px] text-[#8d998f]"
          style={{ animationDelay: "1240ms" }}
        >
          Leva uns 3 minutos. Dá para mudar tudo depois.
        </p>
      </div>

      <Link href="/hoje" className="sr-only">
        Pular para o app
      </Link>
    </div>
  );
}
