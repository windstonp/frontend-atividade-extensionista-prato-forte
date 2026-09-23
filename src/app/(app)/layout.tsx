import { PlanProvider } from "@/lib/plan-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <PlanProvider>{children}</PlanProvider>;
}
