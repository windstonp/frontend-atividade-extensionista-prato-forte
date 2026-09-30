import { Toggle } from "@/components/ui/Toggle";
import type { Avisos } from "../tipos";

export type EstadoDosAvisos = "ok" | "negada" | "sem-suporte" | "ios-sem-pwa" | "sem-servidor";

const MENSAGEM: Record<Exclude<EstadoDosAvisos, "ok">, string> = {
  negada: "Os avisos estão bloqueados no navegador. Libere nas configurações do celular para ligar.",
  "sem-suporte": "Este navegador não recebe avisos. Tente no Chrome do celular.",
  "ios-sem-pwa": "No iPhone, os avisos só funcionam com o Prato Forte na tela de início: toque em Compartilhar → Adicionar à Tela de Início.",
  "sem-servidor": "Os avisos ainda não estão disponíveis neste servidor.",
};

const ITENS: { chave: keyof Avisos; rotulo: string; descricao: string }[] = [
  { chave: "mealReminders", rotulo: "Lembrete de refeição", descricao: "15 minutos antes de cada horário" },
  { chave: "weeklySummary", rotulo: "Resumo da semana", descricao: "Todo domingo à noite" },
  { chave: "tips", rotulo: "Dicas do Nutri", descricao: "No máximo duas por semana" },
];

/** "Avisos no celular" (S19, RF26). Sem suporte ou sem servidor, os interruptores ficam travados. */
export function AvisosNoCelular({
  avisos,
  estado,
  salvando,
  aoMudar,
}: {
  avisos: Avisos;
  estado: EstadoDosAvisos;
  salvando: boolean;
  aoMudar: (chave: keyof Avisos, valor: boolean) => void;
}) {
  const travado = salvando || estado === "sem-suporte" || estado === "ios-sem-pwa" || estado === "sem-servidor";
  return (
    <section>
      <h2 className="mt-[22px] text-[12.5px] font-semibold text-fumo">Avisos no celular</h2>
      {estado !== "ok" ? (
        <p role="status" className="mt-2.5 animate-entra rounded-2xl bg-gema-fraca px-4 py-3 text-[13px] leading-snug text-gema-texto">
          {MENSAGEM[estado]}
        </p>
      ) : null}
      <div className="mt-2.5 rounded-[20px] bg-white px-[18px]">
        {ITENS.map((item, i) => (
          <div key={item.chave} className={i < ITENS.length - 1 ? "border-b border-fio" : ""}>
            <Toggle
              ligado={avisos[item.chave]}
              onChange={(v) => aoMudar(item.chave, v)}
              rotulo={item.rotulo}
              descricao={item.descricao}
              desabilitado={travado}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
