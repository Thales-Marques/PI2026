"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Warehouse,
  ArrowLeftRight,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/itens", label: "Itens", icon: Package },
  { href: "/lotes", label: "Lotes", icon: Boxes },
  { href: "/armazem", label: "Armazém", icon: Warehouse },
  { href: "/fluxo", label: "Fluxo", icon: ArrowLeftRight },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-800/80 bg-[#0F172A] text-slate-200">
      <div className="border-b border-slate-800/80 px-5 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          WMS
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-white">
          Logistics
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Lotes e rastreabilidade
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800/80 p-4 text-[11px] leading-relaxed text-slate-500">
        Projeto acadêmico — painel operacional
      </div>
    </aside>
  );
}
