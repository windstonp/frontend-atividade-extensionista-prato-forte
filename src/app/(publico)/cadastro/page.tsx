import type { Metadata } from "next";
import { Suspense } from "react";
import { TelaCarregando } from "@/components/app/TelaCarregando";
import { CadastroTela } from "@/features/auth/components/CadastroTela";

export const metadata: Metadata = { title: "Criar conta · Prato Forte" };

export default function Page() {
  return (
    <Suspense fallback={<TelaCarregando />}>
      <CadastroTela />
    </Suspense>
  );
}
