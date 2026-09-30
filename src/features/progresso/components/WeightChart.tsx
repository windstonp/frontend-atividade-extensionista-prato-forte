import { CountUp } from "@/components/ui/CountUp";
import { diaCurto, peso as kg } from "@/lib/format";
import { cascata } from "@/lib/motion";
import { rotulosDeData, textoDaPrevisao, textoDaVariacao } from "../regras";
import type { PesoDoPeriodo } from "../tipos";

/** Peso no período: número atual, variação, linha com meta tracejada e previsão (RF24, RN35). */
export function WeightChart({ peso }: { peso: PesoDoPeriodo }) {
  const pontos = peso.points;
  const atual = pontos[pontos.length - 1].weightKg;
  const meta = peso.goalKg;
  const valores = pontos.map((p) => p.weightKg);
  const baixo = Math.min(...valores, meta ?? Infinity) - 0.6;
  const alto = Math.max(...valores, meta ?? -Infinity) + 0.4;
  const y = (v: number) => 108 - ((v - baixo) / (alto - baixo || 1)) * 94;
  const x = (i: number) => (pontos.length === 1 ? 150 : 10 + (i * 280) / (pontos.length - 1));
  const coords = pontos.map((p, i) => ({ px: x(i), py: Number(y(p.weightKg).toFixed(1)) }));
  const linha = coords.map((c) => `${c.px},${c.py}`).join(" ");
  const area = `${linha} ${x(pontos.length - 1)},108 10,108`;
  const comprimento = coords.reduce((soma, c, i) => (i === 0 ? 0 : soma + Math.hypot(c.px - coords[i - 1].px, c.py - coords[i - 1].py)), 0);
  const variacao = peso.changeKg ?? 0;
  const previsao = textoDaPrevisao(peso);
  const rotulo = `Peso de ${kg(pontos[0].weightKg)} para ${kg(atual)}${meta !== null ? `, com meta de ${kg(meta)}` : ""}`;

  return (
    <section className="animate-escala rounded-[20px] bg-white px-[18px] pt-4 pb-3.5" style={{ animationDelay: "120ms" }}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-[32px] font-bold tracking-[-0.03em]">
          <CountUp valor={atual} casas={1} duracao={1100} />{" "}
          <span className="text-base font-semibold tracking-normal text-fumo">kg</span>
        </p>
        <span
          className={`inline-flex h-[26px] shrink-0 animate-pop items-center rounded-full px-2.5 text-[12.5px] font-semibold ${
            variacao === 0 ? "bg-papel text-fumo" : "bg-mata-fraca text-mata-texto"
          }`}
          style={{ animationDelay: "700ms" }}
        >
          {textoDaVariacao(peso)}
        </span>
      </div>

      <svg viewBox="0 0 300 132" width="100%" height={132} role="img" aria-label={rotulo} className="mt-3 block overflow-visible">
        {meta !== null ? (
          <>
            <line x1="0" y1={y(meta)} x2="300" y2={y(meta)} stroke="var(--color-pedra)" strokeWidth="1" strokeDasharray="4 4" />
            <text x="0" y={y(meta) - 5} fontSize="10" fill="var(--color-fumo)" fontFamily="var(--font-sans)">
              meta {kg(meta)}
            </text>
          </>
        ) : null}
        {pontos.length > 1 ? (
          <>
            <polygon points={area} fill="#edefe9" className="animate-fade" style={{ animationDelay: "900ms", animationDuration: "600ms" }} />
            <polyline
              points={linha}
              fill="none"
              stroke="var(--color-tinta)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="desenha"
              style={{ "--tamanho-traco": comprimento } as React.CSSProperties}
            />
          </>
        ) : null}
        {coords.slice(0, -1).map((c, i) => (
          <circle
            key={pontos[i].date}
            cx={c.px}
            cy={c.py}
            r="2.6"
            fill="var(--color-pedra)"
            className="animate-pop"
            style={{ animationDelay: `${240 + Math.min(i, 12) * 90}ms`, transformOrigin: `${c.px}px ${c.py}px` }}
          />
        ))}
        {(() => {
          const c = coords[coords.length - 1];
          const origem = { transformOrigin: `${c.px}px ${c.py}px` };
          return (
            <>
              <circle cx={c.px} cy={c.py} r="9" fill="var(--color-gema)" opacity="0.22" className="animate-halo" style={origem} />
              <circle cx={c.px} cy={c.py} r="6" fill="#ffffff" className="animate-pop" style={{ ...origem, animationDelay: "1150ms" }} />
              <circle cx={c.px} cy={c.py} r="4.5" fill="var(--color-gema)" className="animate-pop" style={{ ...origem, animationDelay: "1200ms" }} />
            </>
          );
        })()}
        <line x1="0" y1="120" x2="300" y2="120" stroke="var(--color-fio)" strokeWidth="1" />
      </svg>

      <div className="relative mt-1.5 h-4 text-[10.5px] text-fumo">
        {rotulosDeData(pontos).map(({ indice, date }, i, todos) => (
          <span
            key={date + indice}
            data-rotulo-data
            className="absolute top-0 animate-entra whitespace-nowrap"
            style={{
              ...cascata(i, 80, 400),
              left: `${(x(indice) / 300) * 100}%`,
              transform: i === 0 ? "none" : i === todos.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            {diaCurto(date)}
          </span>
        ))}
      </div>

      {previsao ? (
        <p className="mt-3 animate-entra border-t border-fio pt-3 text-[13px] leading-normal text-fumo" style={{ animationDelay: "1000ms" }}>
          {previsao}
        </p>
      ) : null}
    </section>
  );
}
