"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/assistant", label: "Assistant", icon: "🤖" },
  { href: "/crm", label: "CRM", icon: "👥" },
  { href: "/tasks", label: "Tasks & Reminders", icon: "✅" },
  { href: "/follow-ups", label: "Follow-ups", icon: "🔄" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 h-screen sticky top-0 border-r border-slate-800 bg-slate-900 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold font-display text-amber-400 tracking-tight">
          Chief of Staff
        </h1>
        <p className="text-xs text-slate-500 mt-1">AI-powered command center</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 mb-3 truncate">
          {session?.user?.email ?? "Guest"}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition rounded-lg hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
