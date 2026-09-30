import { MarcaNutri } from "@/components/icons";

/** Enquanto a resposta não chega. */
export function ThinkingIndicator() {
  return (
    <div className="flex animate-entra gap-2.5">
      <span className="animate-respira">
        <MarcaNutri size={26} />
      </span>
      <div className="flex flex-1 items-center gap-1.5 pt-1.5" role="status">
        <span className="sr-only">O Nutri está montando a resposta</span>
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-pedra motion-safe:animate-bounce" style={{ animationDelay: `${i * 140}ms` }} />
        ))}
      </div>
    </div>
  );
}
