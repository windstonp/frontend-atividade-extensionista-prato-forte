import { Screen } from "@/components/app/Screen";
import { TopBar } from "@/components/app/TopBar";
import { MarcaNutri } from "@/components/icons";

/** Casca das telas de conta: voltar, título que entra, texto e o formulário ocupando o resto. */
export function AuthScreen({
  voltarPara,
  rotuloVoltar = "Voltar",
  titulo,
  texto,
  children,
}: {
  voltarPara: string;
  rotuloVoltar?: string;
  titulo: string;
  texto?: string;
  children: React.ReactNode;
}) {
  const palavras = titulo.split(" ");
  const fimDoTitulo = 60 + palavras.length * 55;

  return (
    <Screen>
      <TopBar
        voltarPara={voltarPara}
        rotuloVoltar={rotuloVoltar}
        direita={
          <span aria-hidden="true" className="animate-flutua text-tinta">
            <MarcaNutri size={18} />
          </span>
        }
      />
      <main className="flex flex-1 flex-col px-6 pt-4 pb-seguro-8">
        {/* Palavra por palavra; os espaços ficam fora dos spans para o nome acessível continuar inteiro. */}
        <h1 className="font-display text-[30px] leading-[1.08] font-bold tracking-[-0.028em]">
          {palavras.map((palavra, i) => (
            <span key={i}>
              {i > 0 ? " " : null}
              <span className="inline-block animate-entra" style={{ animationDelay: `${40 + i * 55}ms` }}>
                {palavra}
              </span>
            </span>
          ))}
        </h1>
        {/* O tique gema da régua da Boas-vindas, agora marcando o título. */}
        <span
          aria-hidden="true"
          className="mt-3 block h-[3px] w-9 origin-left animate-tique rounded-full bg-gema"
          style={{ animationDelay: `${fimDoTitulo}ms` }}
        />
        {texto ? (
          <p
            className="mt-3 max-w-[330px] animate-entra text-[14.5px] leading-normal text-fumo"
            style={{ animationDelay: `${fimDoTitulo + 40}ms` }}
          >
            {texto}
          </p>
        ) : null}
        <div className="mt-7 flex flex-1 flex-col">{children}</div>
      </main>
    </Screen>
  );
}
