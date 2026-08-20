import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";

export default function PersonalLayout({ children }: { children: ReactNode }) {
  return <AppShell variant="postulante">{children}</AppShell>;
}
