import Link from "next/link";
import type { ReactNode } from "react";

import { AdminSideNav, AppNav } from "@/components/layout/AppNav";
import { APP_INITIALS, APP_NAME_PARTS } from "@/lib/brand";

type Props = {
  children: ReactNode;
  variant?: "portal" | "empresa" | "postulante" | "admin";
};

export function AppShell({ children, variant = "portal" }: Props) {
  if (variant === "admin") {
    return (
      <div className="min-h-screen overflow-x-hidden bg-mesh">
        <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
                {APP_INITIALS}
              </span>
              <span className="font-bold text-slate-900">
                {APP_NAME_PARTS.first}
                <span className="text-emerald-600">{APP_NAME_PARTS.second}</span>
                <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Admin
                </span>
              </span>
            </Link>
            <AppNav variant="admin" />
          </div>
        </header>
        <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-6 md:px-6 md:py-8">
          <aside className="hidden w-56 shrink-0 md:block">
            <div className="sticky top-24 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
              <AdminSideNav />
            </div>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        <div className="border-t border-emerald-100 bg-white px-4 py-3 md:hidden">
          <AdminSideNav />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-mesh ${
        variant === "portal" ? "h-dvh overflow-hidden" : "min-h-dvh overflow-x-hidden"
      }`}
    >
      <header className="sticky top-0 z-40 shrink-0 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
        <div
          className={`mx-auto flex w-full items-center justify-between px-4 py-4 md:px-6 ${
            variant === "portal" ? "max-w-[1440px]" : "max-w-6xl"
          }`}
        >
          <Link
            href={variant === "empresa" ? "/empresa" : "/"}
            className="flex items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
              {APP_INITIALS}
            </span>
            <span className="font-bold text-slate-900">
              {APP_NAME_PARTS.first}
              <span className="text-emerald-600">{APP_NAME_PARTS.second}</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-sm font-semibold">
            <AppNav variant={variant} />
          </nav>
        </div>
      </header>

      <main
        className={
          variant === "portal"
            ? "mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col"
            : "mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-10"
        }
      >
        {children}
      </main>
    </div>
  );
}
