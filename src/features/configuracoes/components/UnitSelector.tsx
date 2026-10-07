import { Segmento } from "@/components/ui/Field";
import type { SistemaDeMedidas } from "../tipos";

/**
 * Medidas do app (RF30). Travado enquanto outra preferência está sendo salva: uma alteração por vez.
 * aria-disabled (não disabled): o foco de quem usa teclado não cai para o <body> no meio do salvamento.
 */
export function UnitSelector({
  valor,
  salvando,
  aoMudar,
}: {
  valor: SistemaDeMedidas;
  salvando: boolean;
  aoMudar: (valor: SistemaDeMedidas) => void;
}) {
  return (
    <div role="group" aria-disabled={salvando || undefined} className="mt-[22px] aria-disabled:opacity-60">
      <Segmento
        label="Medidas"
        valor={valor}
        onChange={(v: SistemaDeMedidas) => {
          if (!salvando) aoMudar(v);
        }}
        opcoes={[
          { valor: "metric", rotulo: "Quilo e centímetro" },
          { valor: "imperial", rotulo: "Libra e polegada" },
        ]}
      />
    </div>
  );
}
