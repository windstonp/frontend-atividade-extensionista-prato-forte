import type { Metadata } from "next";
import { EsqueciTela } from "@/features/auth/components/EsqueciTela";

export const metadata: Metadata = { title: "Recuperar senha · Prato Forte" };

export default function Page() {
  return <EsqueciTela />;
}
