import Link from "next/link";
import { IconeRecomecar } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { cascata } from "@/lib/motion";
import type { AcaoNutri } from "../tipos";

const contorno =
  "group flex h-11 animate-entra items-center justify-center gap-2 rounded-full border-[1.5px] border-linha text-sm font-semibold transition-[border-color,transform] duration-250 hover:-translate-y-px hover:border-tinta active:scale-95 disabled:opacity-50";

/** Ações da resposta (RF21). A executável fica ocupada enquanto aplica; as outras esperam. */
export function NutriActions({
  acoes,
  aplicando,
  aoAgir,
}: {
  acoes: AcaoNutri[];
  aplicando: boolean;
  aoAgir: (acao: AcaoNutri) => void;
}) {
  if (acoes.length === 0) return null;
  return (
    <div className="mt-3.5 flex flex-col gap-2">
      {acoes.map((acao, i) =>
        acao.kind === "ver-refeicao" ? (
          <Link key={acao.index} href={`/dieta/${acao.slot}`} style={cascata(i, 70, 620)} className={contorno}>
            {acao.label}
          </Link>
        ) : acao.kind === "substituir" || acao.kind === "aplicar-refeicao" ? (
          <div key={acao.index} style={cascata(i, 70, 620)} className="animate-entra">
            <Button tamanho="media" className="w-full" carregando={aplicando} onClick={() => aoAgir(acao)}>
              {acao.label}
            </Button>
          </div>
        ) : (
          <button key={acao.index} type="button" disabled={aplicando} onClick={() => aoAgir(acao)} style={cascata(i, 70, 620)} className={contorno}>
            {acao.kind === "outra-opcao" ? (
              <IconeRecomecar size={16} className="transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:rotate-180" />
            ) : null}
            {acao.label}
          </button>
        ),
      )}
    </div>
  );
}
