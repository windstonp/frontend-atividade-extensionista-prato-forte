import { IconeEnviar } from "@/components/icons";

const LIMITE = 1000;

/** Campo da pergunta (1–1.000 caracteres). */
export function ChatComposer({
  valor,
  aoMudar,
  aoEnviar,
  enviando,
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  aoEnviar: () => void;
  enviando: boolean;
}) {
  const vazio = valor.trim() === "";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!vazio && !enviando) aoEnviar();
      }}
      className="shrink-0 border-t border-linha px-4 pt-3 pb-seguro-5"
    >
      {valor.length > 900 ? (
        <p className="mb-1.5 text-right text-xs text-fumo" aria-live="polite">
          {valor.length.toLocaleString("pt-BR")}/{LIMITE.toLocaleString("pt-BR")}
        </p>
      ) : null}
      <div className="flex items-center gap-2.5">
        <label htmlFor="pergunta" className="sr-only">
          Escreva sua pergunta para o Nutri
        </label>
        <input
          id="pergunta"
          value={valor}
          maxLength={LIMITE}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder="Escreva sua pergunta"
          className="h-[50px] flex-1 rounded-full border border-linha bg-white px-4 text-[14.5px] transition placeholder:text-fumo focus:border-tinta focus:shadow-[inset_0_0_0_1px_var(--color-tinta)] focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Enviar pergunta"
          disabled={vazio || enviando}
          className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-tinta text-neve transition active:scale-90 disabled:opacity-40"
        >
          <IconeEnviar size={20} />
        </button>
      </div>
    </form>
  );
}
