import type { Metadata } from "next";
import { Suspense } from "react";
import { TelaCarregando } from "@/components/app/TelaCarregando";
import { RedefinirTela } from "@/features/auth/components/RedefinirTela";

export const metadata: Metadata = { title: "Senha nova · Prato Forte" };

export default function Page() {
  return (
    <Suspense fallback={<TelaCarregando />}>
      <RedefinirTela />
    </Suspense>
  );
}
