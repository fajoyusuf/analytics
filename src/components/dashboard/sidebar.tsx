import Link from "next/link";
import { BarChart3, ChartColumnBig, SearchX, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/overview", label: "Overview", icon: BarChart3 },
  { href: "/creatives", label: "Creatives", icon: Sparkles },
  { href: "/analysis", label: "Analysis", icon: ChartColumnBig },
  { href: "/unmapped-ads", label: "Unmapped Ads", icon: SearchX },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="w-full border-b border-slate-800 bg-slate-950 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="px-4 py-4">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-400">Dev Mode</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-100">Creative Analytics</h1>
      </div>
      <nav className="px-2 pb-4 md:pb-0">
        <ul className="flex gap-1 overflow-x-auto md:block">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-900",
                    active && "bg-slate-900 text-sky-300"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
