import type { Metadata } from "next";
import { Suspense } from "react";
import { TelaCarregando } from "@/components/app/TelaCarregando";
import { EntrarTela } from "@/features/auth/components/EntrarTela";

export const metadata: Metadata = { title: "Entrar · Prato Forte" };

export default function Page() {
  return (
    <Suspense fallback={<TelaCarregando />}>
      <EntrarTela />
    </Suspense>
  );
}
