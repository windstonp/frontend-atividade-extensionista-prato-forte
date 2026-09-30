import { Suspense } from "react";
import { TelaCarregando } from "@/components/app/TelaCarregando";
import { AuthGate } from "@/features/auth/components/AuthGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<TelaCarregando />}>
      <AuthGate area="app">
        {children}
      </AuthGate>
    </Suspense>
  );
}
