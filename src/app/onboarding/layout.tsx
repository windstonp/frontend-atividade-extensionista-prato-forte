import { Suspense } from "react";
import { TelaCarregando } from "@/components/app/TelaCarregando";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { OnboardingProvider } from "@/lib/onboarding-store";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<TelaCarregando />}>
      <AuthGate area="onboarding">
        <OnboardingProvider>{children}</OnboardingProvider>
      </AuthGate>
    </Suspense>
  );
}
