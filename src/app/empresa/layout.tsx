import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";

export default function EmpresaLayout({ children }: { children: ReactNode }) {
  return <AppShell variant="empresa">{children}</AppShell>;
}
