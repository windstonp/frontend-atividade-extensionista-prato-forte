import { MarcaNutri } from "@/components/icons";
import { Screen } from "./Screen";

/** Espera curta enquanto os guardas confirmam a sessão. */
export function TelaCarregando() {
  return (
    <Screen>
      <div role="status" aria-busy="true" className="flex flex-1 flex-col items-center justify-center">
        <span className="relative grid place-items-center">
          <span aria-hidden="true" className="absolute size-12 animate-halo rounded-full bg-gema/50" />
          <span className="relative grid size-12 place-items-center rounded-full bg-gema text-tinta">
            <MarcaNutri size={26} />
          </span>
        </span>
        <span className="sr-only">Carregando…</span>
      </div>
    </Screen>
  );
}
