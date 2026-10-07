"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Segmento } from "@/components/ui/Field";
import type { AlimentoProprioDados, Medida } from "../tipos";

const num = (t: string) => Number(t.trim().replace(",", "."));

/** RF35/RF37 — cadastrar ou editar alimento próprio, valores por 100 g/ml. */
export function CustomFoodForm({ inicial, salvando, erros, aoSalvar, aoApagar, aoVoltar }: {
  inicial?: Partial<AlimentoProprioDados> & { id?: number }; salvando: boolean; erros: Record<string, string>;
  aoSalvar: (d: AlimentoProprioDados) => void; aoApagar?: () => void; aoVoltar: () => void;
}) {
  const [nome, setNome] = useState(inicial?.name ?? "");
  const [medida, setMedida] = useState<Medida>(inicial?.measure ?? "g");
  const p = inicial?.per100;
  const [v, setV] = useState({ calories: p ? String(p.calories) : "", protein: p ? String(p.protein) : "", carbs: p ? String(p.carbs) : "", fat: p ? String(p.fat) : "" });
  const [confirmando, setConfirmando] = useState(false);
  const campo = (k: keyof typeof v, rotulo: string, sufixo: string) => (
    <Field id={`proprio-${k}`} label={rotulo} sufixo={sufixo} erro={erros[`per100.${k}`]} inputMode="decimal" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
  );

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); aoSalvar({ name: nome, measure: medida, per100: { calories: num(v.calories), protein: num(v.protein), carbs: num(v.carbs), fat: num(v.fat) } }); }}>
      <h3 className="font-display text-[22px] font-bold tracking-[-0.02em]">{inicial?.id ? "Editar alimento" : "Cadastrar alimento"}</h3>
      <p className="mt-0.5 text-[13px] text-fumo">Copie da tabela nutricional da embalagem.</p>
      <div className="mt-4 flex flex-col gap-3.5">
        <Field id="proprio-nome" label="Nome" erro={erros.name} value={nome} onChange={(e) => setNome(e.target.value)} />
        <Segmento label="Medida" opcoes={[{ valor: "g", rotulo: "Sólido (g)" }, { valor: "ml", rotulo: "Líquido (ml)" }]} valor={medida} onChange={setMedida} erro={erros.measure} />
        <p className="text-[12.5px] font-semibold text-fumo">Em 100 {medida}</p>
        {campo("calories", "Calorias", "kcal")}
        {erros.per100 ? <p className="text-[12.5px] font-medium text-alerta">{erros.per100}</p> : null}
        {campo("protein", "Proteína", "g")}
        {campo("carbs", "Carboidrato", "g")}
        {campo("fat", "Gordura", "g")}
      </div>
      <div className="mt-5 flex flex-col gap-2.5">
        <Button type="submit" tamanho="grande" carregando={salvando}>{inicial?.id ? "Salvar" : "Salvar e continuar"}</Button>
        {aoApagar ? (
          confirmando ? (
            <div className="rounded-2xl bg-alerta-fraca p-4">
              <p className="text-[13.5px] text-alerta-texto">Apagar {nome}? O que você já registrou com ele continua no histórico.</p>
              <div className="mt-3 flex gap-2">
                <Button variante="destrutiva" tamanho="media" onClick={aoApagar}>Apagar</Button>
                <Button variante="texto" tamanho="media" onClick={() => setConfirmando(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <Button variante="texto" onClick={() => setConfirmando(true)}>Apagar alimento</Button>
          )
        ) : null}
        <Button variante="texto" onClick={aoVoltar}>Voltar</Button>
      </div>
    </form>
  );
}
