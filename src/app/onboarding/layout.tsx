import { Suspense } from "react";
import { TelaCarregando } from "@/components/app/TelaCarregando";
import { AuthGate } from "@/features/auth/components/AuthGate";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<TelaCarregando />}>
      <AuthGate area="onboarding">{children}</AuthGate>
    </Suspense>
  );
}
