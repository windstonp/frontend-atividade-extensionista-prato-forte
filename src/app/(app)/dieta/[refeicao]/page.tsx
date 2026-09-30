"use client";

import { useParams } from "next/navigation";
import { DetalheTela } from "@/features/dia/components/DetalheTela";

export default function DetalheRefeicao() {
  const { refeicao } = useParams<{ refeicao: string }>();
  return <DetalheTela slot={refeicao} />;
}
