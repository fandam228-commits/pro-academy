import { ReactNode } from "react";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {children}
      <MobileBottomNav />
    </div>
  );
}
