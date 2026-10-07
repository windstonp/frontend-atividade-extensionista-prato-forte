"use client";

import { useParams, useSearchParams } from "next/navigation";
import { DetalheTela } from "@/features/dia/components/DetalheTela";

/** `?data=AAAA-MM-DD` abre a refeição de ontem (spec 09 RF36); sem ela, hoje. */
export default function DetalheRefeicao() {
  const { refeicao } = useParams<{ refeicao: string }>();
  const data = useSearchParams().get("data") ?? undefined;
  return <DetalheTela slot={refeicao} data={data} />;
}
