import { Segmento } from "@/components/ui/Field";
import type { SistemaDeMedidas } from "../tipos";

/** Medidas do app (RF30). Travado enquanto outra preferência está sendo salva: uma alteração por vez. */
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
    <fieldset disabled={salvando} className="mt-[22px] min-w-0 disabled:opacity-60">
      <Segmento
        label="Medidas"
        valor={valor}
        onChange={aoMudar}
        opcoes={[
          { valor: "metric", rotulo: "Quilo e centímetro" },
          { valor: "imperial", rotulo: "Libra e polegada" },
        ]}
      />
    </fieldset>
  );
}
