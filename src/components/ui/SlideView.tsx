"use client";

import type { ReactNode } from "react";

import { MOTION_REDUCE, viewFadeClass } from "@/lib/motion";

export type SlideDirection = "forward" | "back" | "fade";

type Props = {
  viewKey: string | number;
  direction?: SlideDirection;
  className?: string;
  children: ReactNode;
};

/** Desvanecido al cambiar de paso/vista interna (misma ventana). */
export function SlideView({
  viewKey,
  className = "",
  children,
}: Props) {
  return (
    <div
      key={viewKey}
      className={`${viewFadeClass()} ${MOTION_REDUCE} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
