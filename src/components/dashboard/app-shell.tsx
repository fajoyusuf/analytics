"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
      <Sidebar pathname={pathname} />
      <main className="w-full px-4 py-4 md:px-6 md:py-6">{children}</main>
    </div>
  );
}
