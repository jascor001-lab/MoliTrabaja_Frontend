import Link from "next/link";
import type { ReactNode } from "react";

import { AppNav } from "@/components/layout/AppNav";
import { APP_INITIALS, APP_NAME_PARTS } from "@/lib/brand";

type Props = {
  children: ReactNode;
  variant?: "portal" | "empresa";
};

export function AppShell({ children, variant = "portal" }: Props) {
  return (
    <div className="min-h-screen bg-mesh">
      <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
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
            ? "mx-auto w-full max-w-[1440px]"
            : "mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10"
        }
      >
        {children}
      </main>
    </div>
  );
}
