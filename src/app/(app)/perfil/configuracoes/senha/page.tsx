import type { Metadata } from "next";
import { TrocarSenhaTela } from "@/features/auth/components/TrocarSenhaTela";

export const metadata: Metadata = { title: "Trocar senha · Prato Forte" };

export default function Page() {
  return <TrocarSenhaTela />;
}
