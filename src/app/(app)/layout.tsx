import { Suspense } from "react";
import { TelaCarregando } from "@/components/app/TelaCarregando";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { PlanProvider } from "@/lib/plan-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<TelaCarregando />}>
      <AuthGate area="app">
        <PlanProvider>{children}</PlanProvider>
      </AuthGate>
    </Suspense>
  );
}
